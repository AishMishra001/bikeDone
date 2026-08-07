package com.bikedone.usermanagement.mechanic.service.impl;

import com.bikedone.usermanagement.common.datetime.DateTimeProvider;
import com.bikedone.usermanagement.common.logging.LogLevel;
import com.bikedone.usermanagement.common.logging.LogStep;
import com.bikedone.usermanagement.common.logging.Logger;
import com.bikedone.usermanagement.config.JwtProperties;
import com.bikedone.usermanagement.config.MobileVerificationProperties;
import com.bikedone.usermanagement.constants.SecurityConstants;
import com.bikedone.usermanagement.dto.response.MobileVerificationResponse;
import com.bikedone.usermanagement.enums.IntegrationProvider;
import com.bikedone.usermanagement.enums.UserStatus;
import com.bikedone.usermanagement.exception.BadRequestException;
import com.bikedone.usermanagement.mechanic.dto.request.SendMechanicOtpRequest;
import com.bikedone.usermanagement.mechanic.dto.request.VerifyMechanicOtpRequest;
import com.bikedone.usermanagement.mechanic.dto.response.MechanicLoginResponse;
import com.bikedone.usermanagement.mechanic.dto.response.MechanicUserResponse;
import com.bikedone.usermanagement.mechanic.entity.MechanicOtp;
import com.bikedone.usermanagement.mechanic.entity.MechanicUser;
import com.bikedone.usermanagement.mechanic.repository.MechanicOtpRepository;
import com.bikedone.usermanagement.mechanic.repository.MechanicUserRepository;
import com.bikedone.usermanagement.mechanic.service.MechanicAuthService;
import com.bikedone.usermanagement.security.jwt.JwtService;
import com.bikedone.usermanagement.security.user.UserPrincipal;
import com.bikedone.usermanagement.service.IntegrationConfigurationService;
import com.bikedone.usermanagement.service.SmsService;
import com.bikedone.usermanagement.util.OtpGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MechanicAuthServiceImpl implements MechanicAuthService {

    private final MechanicUserRepository mechanicUserRepository;
    private final MechanicOtpRepository mechanicOtpRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpGenerator otpGenerator;
    private final SmsService smsService;
    private final DateTimeProvider dateTimeProvider;
    private final MobileVerificationProperties properties;
    private final IntegrationConfigurationService integrationConfigurationService;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;

    @Override
    @Transactional
    public MobileVerificationResponse sendOtp(SendMechanicOtpRequest request) {
        String mobileNumber = request.getMobileNumber();

        MechanicUser mechanic = mechanicUserRepository.findByMobileNumber(mobileNumber)
                .orElseGet(() -> createMechanic(mobileNumber));

        if (Boolean.TRUE.equals(mechanic.getBlocked())) {
            throw new BadRequestException("Your account has been blocked. Please contact support.");
        }

        validateResendCooldown(mechanic);

        IntegrationProvider activeProvider = integrationConfigurationService
                .getActiveConfiguration()
                .getProvider();

        if (IntegrationProvider.FIREBASE.equals(activeProvider)) {
            Logger.printLog(
                    LogLevel.INFO,
                    LogStep.AUTH,
                    "Mechanic OTP requested via Firebase.",
                    "Returning instruction for client to initiate Firebase Auth.",
                    mechanic.getId().toString(),
                    null
            );

            return MobileVerificationResponse.builder()
                    .provider(IntegrationProvider.FIREBASE)
                    .clientShouldInitiateFirebase(true)
                    .build();
        }

        String otp = otpGenerator.generateOtp();
        MechanicOtp otpEntity = buildOtpEntity(mechanic, otp);
        mechanicOtpRepository.save(otpEntity);

        try {
            smsService.sendOtp(mechanic.getMobileNumber(), otp);
        } catch (Exception ex) {
            Logger.printLog(
                    LogLevel.ERROR,
                    LogStep.AUTH,
                    "Failed to send mechanic OTP.",
                    ex.getMessage(),
                    mechanic.getId().toString(),
                    null
            );
            mechanicOtpRepository.delete(otpEntity);
            throw new BadRequestException("Unable to send OTP. Please try again later.");
        }

        Logger.printLog(
                LogLevel.INFO,
                LogStep.AUTH,
                "Mechanic OTP sent successfully.",
                "OTP sent to mechanic mobile: " + mobileNumber,
                mechanic.getId().toString(),
                otpEntity.getId().toString()
        );

        return MobileVerificationResponse.builder()
                .provider(IntegrationProvider.AWS_SNS)
                .clientShouldInitiateFirebase(false)
                .build();
    }

    @Override
    @Transactional
    public MechanicLoginResponse verifyOtp(VerifyMechanicOtpRequest request) {
        String mobileNumber = request.getMobileNumber();

        MechanicUser mechanic = mechanicUserRepository.findByMobileNumber(mobileNumber)
                .orElseThrow(() -> new BadRequestException("Mechanic not found with mobile number: " + mobileNumber));

        MechanicOtp mechanicOtp = mechanicOtpRepository.findByMechanic(mechanic)
                .orElseThrow(() -> new BadRequestException("No active OTP found. Please request a new OTP."));

        if (Boolean.TRUE.equals(mechanic.getBlocked())) {
            throw new BadRequestException("Your account has been blocked. Please contact support.");
        }

        validateOtpExpiration(mechanicOtp);
        validateOtp(mechanic, mechanicOtp, request.getOtp());

        mechanic.setMobileVerified(true);
        mechanicUserRepository.save(mechanic);
        mechanicOtpRepository.delete(mechanicOtp);

        UserPrincipal principal = new UserPrincipal(mechanic);
        String accessToken = jwtService.generateToken(principal);

        Logger.printLog(
                LogLevel.INFO,
                LogStep.AUTH,
                "Mechanic OTP verified successfully.",
                "Mechanic logged in via mobile OTP.",
                mechanic.getId().toString(),
                null
        );

        MechanicUserResponse mechanicResponse = MechanicUserResponse.builder()
                .id(mechanic.getId())
                .firstName(mechanic.getFirstName())
                .lastName(mechanic.getLastName())
                .email(mechanic.getEmail())
                .mobileNumber(mechanic.getMobileNumber())
                .status(mechanic.getStatus().name())
                .mobileVerified(mechanic.getMobileVerified())
                .isBlocked(mechanic.getBlocked())
                .build();

        return MechanicLoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(null)
                .tokenType(SecurityConstants.TOKEN_TYPE)
                .accessTokenExpiresIn(jwtProperties.getAccessTokenExpiration())
                .refreshTokenExpiresIn(jwtProperties.getRefreshTokenExpiration())
                .mechanic(mechanicResponse)
                .build();
    }

    @Override
    @Transactional
    public MechanicLoginResponse verifyFirebaseToken(String mobileNumber, String firebaseIdToken) {
        MechanicUser mechanic = mechanicUserRepository.findByMobileNumber(mobileNumber)
                .orElseGet(() -> createMechanic(mobileNumber));

        if (Boolean.TRUE.equals(mechanic.getBlocked())) {
            throw new BadRequestException("Your account has been blocked. Please contact support.");
        }

        if (com.google.firebase.FirebaseApp.getApps().isEmpty()) {
            throw new BadRequestException("Firebase Admin SDK is not initialized. Please verify Firebase service account configuration.");
        }

        try {
            com.google.firebase.auth.FirebaseAuth auth = com.google.firebase.auth.FirebaseAuth.getInstance();
            com.google.firebase.auth.FirebaseToken decodedToken = auth.verifyIdToken(firebaseIdToken);

            Logger.printLog(
                    LogLevel.INFO,
                    LogStep.AUTH,
                    "Firebase ID token verified successfully for mechanic.",
                    "Firebase UID: " + decodedToken.getUid(),
                    mechanic.getId().toString(),
                    null
            );

            mechanic.setMobileVerified(true);
            mechanicUserRepository.save(mechanic);

        } catch (Exception ex) {
            Logger.printLog(
                    LogLevel.ERROR,
                    LogStep.AUTH,
                    "Firebase ID token verification failed for mechanic.",
                    ex.getMessage(),
                    mechanic.getId().toString(),
                    null
            );
            throw new BadRequestException("Invalid or expired Firebase ID Token: " + ex.getMessage());
        }

        UserPrincipal principal = new UserPrincipal(mechanic);
        String accessToken = jwtService.generateToken(principal);

        MechanicUserResponse mechanicResponse = MechanicUserResponse.builder()
                .id(mechanic.getId())
                .firstName(mechanic.getFirstName())
                .lastName(mechanic.getLastName())
                .email(mechanic.getEmail())
                .mobileNumber(mechanic.getMobileNumber())
                .status(mechanic.getStatus().name())
                .mobileVerified(mechanic.getMobileVerified())
                .isBlocked(mechanic.getBlocked())
                .build();

        return MechanicLoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(null)
                .tokenType(SecurityConstants.TOKEN_TYPE)
                .accessTokenExpiresIn(jwtProperties.getAccessTokenExpiration())
                .refreshTokenExpiresIn(jwtProperties.getRefreshTokenExpiration())
                .mechanic(mechanicResponse)
                .build();
    }

    private MechanicUser createMechanic(String mobileNumber) {
        MechanicUser newMechanic = MechanicUser.builder()
                .firstName("")
                .lastName("")
                .email(null)
                .mobileNumber(mobileNumber)
                .status(UserStatus.INACTIVE)
                .mobileVerified(false)
                .deleted(false)
                .build();

        MechanicUser saved = mechanicUserRepository.save(newMechanic);

        Logger.printLog(
                LogLevel.INFO,
                LogStep.AUTH,
                "New mechanic record created.",
                "Mechanic registered with mobile: " + mobileNumber,
                saved.getId().toString(),
                null
        );

        return saved;
    }

    private void validateResendCooldown(MechanicUser mechanic) {
        Optional<MechanicOtp> optionalOtp = mechanicOtpRepository.findByMechanic(mechanic);
        if (optionalOtp.isEmpty()) {
            return;
        }

        MechanicOtp otp = optionalOtp.get();
        LocalDateTime nextAllowedTime = otp.getCreatedAt().plusSeconds(properties.getResendCooldownInSeconds());

        if (dateTimeProvider.now().isBefore(nextAllowedTime)) {
            throw new BadRequestException("Please wait before requesting another OTP.");
        }
    }

    private void validateOtpExpiration(MechanicOtp otp) {
        if (dateTimeProvider.now().isAfter(otp.getExpiresAt())) {
            mechanicOtpRepository.delete(otp);
            throw new BadRequestException("OTP has expired. Please request a new OTP.");
        }
    }

    private void validateOtp(MechanicUser mechanic, MechanicOtp entity, String enteredOtp) {
        if (passwordEncoder.matches(enteredOtp, entity.getOtpHash())) {
            return;
        }

        entity.setAttempts(entity.getAttempts() + 1);

        if (entity.getAttempts() >= properties.getMaxAttempts()) {
            mechanicOtpRepository.delete(entity);
            throw new BadRequestException("Maximum OTP attempts exceeded. Please request a new OTP.");
        }

        mechanicOtpRepository.save(entity);
        throw new BadRequestException("Invalid OTP.");
    }

    private MechanicOtp buildOtpEntity(MechanicUser mechanic, String otp) {
        MechanicOtp entity = mechanicOtpRepository.findByMechanic(mechanic)
                .orElseGet(() -> {
                    MechanicOtp newEntity = new MechanicOtp();
                    newEntity.setId(UUID.randomUUID());
                    newEntity.setMechanic(mechanic);
                    return newEntity;
                });

        entity.setMobileNumber(mechanic.getMobileNumber());
        entity.setOtpHash(passwordEncoder.encode(otp));
        entity.setAttempts(0);
        entity.setVerifiedAt(null);

        LocalDateTime now = dateTimeProvider.now();
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);
        entity.setExpiresAt(now.plusMinutes(properties.getExpirationInMinutes()));

        return entity;
    }
}
