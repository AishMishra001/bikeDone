package com.bikedone.usermanagement.strategy.impl;

import com.bikedone.usermanagement.common.datetime.DateTimeProvider;
import com.bikedone.usermanagement.common.logging.LogLevel;
import com.bikedone.usermanagement.common.logging.LogStep;
import com.bikedone.usermanagement.common.logging.Logger;
import com.bikedone.usermanagement.config.MobileVerificationProperties;
import com.bikedone.usermanagement.dto.response.MobileVerificationResponse;
import com.bikedone.usermanagement.entity.MobileVerificationOtp;
import com.bikedone.usermanagement.entity.User;
import com.bikedone.usermanagement.enums.IntegrationProvider;
import com.bikedone.usermanagement.exception.BadRequestException;
import com.bikedone.usermanagement.repository.MobileVerificationOtpRepository;
import com.bikedone.usermanagement.repository.UserRepository;
import com.bikedone.usermanagement.service.SmsService;
import com.bikedone.usermanagement.strategy.MobileVerificationStrategy;
import com.bikedone.usermanagement.util.OtpGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class AwsMobileVerificationStrategy implements MobileVerificationStrategy {

    private final MobileVerificationOtpRepository mobileVerificationOtpRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpGenerator otpGenerator;
    private final SmsService smsService;
    private final DateTimeProvider dateTimeProvider;
    private final MobileVerificationProperties properties;

    @Override
    public IntegrationProvider getProvider() {
        return IntegrationProvider.AWS_SNS;
    }

    @Override
    public MobileVerificationResponse sendOtp(User user) {
        validateResendCooldown(user);

        String otp = otpGenerator.generateOtp();
        MobileVerificationOtp entity = buildOtpEntity(user, otp);
        mobileVerificationOtpRepository.save(entity);

        try {
            smsService.sendOtp(user.getMobileNumber(), otp);
        } catch (Exception ex) {
            Logger.printLog(
                    LogLevel.ERROR,
                    LogStep.AUTH,
                    "Failed to send OTP.",
                    ex.getMessage(),
                    user.getId().toString(),
                    null
            );

            mobileVerificationOtpRepository.delete(entity);
            throw new BadRequestException("Unable to send OTP. Please try again later.");
        }

        Logger.printLog(
                LogLevel.INFO,
                LogStep.AUTH,
                "Mobile verification OTP sent successfully.",
                "OTP sent successfully via AWS SNS.",
                user.getId().toString(),
                entity.getId().toString()
        );

        return MobileVerificationResponse.builder()
                .provider(IntegrationProvider.AWS_SNS)
                .clientShouldInitiateFirebase(false)
                .build();
    }

    @Override
    public void resendOtp(User user) {
        sendOtp(user);
    }

    @Override
    public void verifyOtp(User user, String otp) {
        MobileVerificationOtp mobileVerificationOtp =
                mobileVerificationOtpRepository.findByUser(user)
                        .orElseThrow(() -> {
                            Logger.printLog(
                                    LogLevel.WARN,
                                    LogStep.AUTH,
                                    "Mobile verification OTP not found.",
                                    "No active OTP found.",
                                    user.getId().toString(),
                                    null
                            );
                            return new BadRequestException("No active OTP found.");
                        });

        validateOtpExpiration(mobileVerificationOtp);
        validateOtp(user, mobileVerificationOtp, otp);

        user.setMobileVerified(true);
        userRepository.save(user);
        mobileVerificationOtpRepository.delete(mobileVerificationOtp);

        Logger.printLog(
                LogLevel.INFO,
                LogStep.AUTH,
                "Mobile number verified successfully.",
                "Mobile verification completed via AWS SNS.",
                user.getId().toString(),
                null
        );
    }

    @Override
    public void verifyFirebaseToken(User user, String firebaseIdToken) {
        throw new BadRequestException("Firebase token verification is not supported when AWS SNS is the active provider.");
    }

    private void validateOtpExpiration(MobileVerificationOtp otp) {
        if (dateTimeProvider.now().isAfter(otp.getExpiresAt())) {
            mobileVerificationOtpRepository.delete(otp);

            Logger.printLog(
                    LogLevel.WARN,
                    LogStep.AUTH,
                    "OTP expired.",
                    "Mobile verification OTP expired.",
                    otp.getUser().getId().toString(),
                    otp.getId().toString()
            );

            throw new BadRequestException("OTP has expired. Please request a new OTP.");
        }
    }

    private void validateOtp(User user, MobileVerificationOtp entity, String enteredOtp) {
        if (passwordEncoder.matches(enteredOtp, entity.getOtpHash())) {
            return;
        }

        entity.setAttempts(entity.getAttempts() + 1);

        if (entity.getAttempts() >= properties.getMaxAttempts()) {
            mobileVerificationOtpRepository.delete(entity);

            Logger.printLog(
                    LogLevel.WARN,
                    LogStep.AUTH,
                    "Maximum OTP attempts exceeded.",
                    "OTP deleted after maximum failed attempts.",
                    user.getId().toString(),
                    entity.getId().toString()
            );

            throw new BadRequestException("Maximum OTP attempts exceeded. Please request a new OTP.");
        }

        mobileVerificationOtpRepository.save(entity);

        Logger.printLog(
                LogLevel.WARN,
                LogStep.AUTH,
                "Invalid OTP.",
                "Incorrect OTP entered.",
                user.getId().toString(),
                entity.getId().toString()
            );

        throw new BadRequestException("Invalid OTP.");
    }

    private void validateResendCooldown(User user) {
        Optional<MobileVerificationOtp> optionalOtp = mobileVerificationOtpRepository.findByUser(user);
        if (optionalOtp.isEmpty()) {
            return;
        }

        MobileVerificationOtp otp = optionalOtp.get();
        LocalDateTime nextAllowedTime = otp.getCreatedAt().plusSeconds(properties.getResendCooldownInSeconds());

        if (dateTimeProvider.now().isBefore(nextAllowedTime)) {
            throw new BadRequestException("Please wait before requesting another OTP.");
        }
    }

    private MobileVerificationOtp buildOtpEntity(User user, String otp) {
        MobileVerificationOtp entity = mobileVerificationOtpRepository.findByUser(user)
                .orElseGet(() -> {
                    MobileVerificationOtp newEntity = new MobileVerificationOtp();
                    newEntity.setId(UUID.randomUUID());
                    newEntity.setUser(user);
                    return newEntity;
                });

        entity.setMobileNumber(user.getMobileNumber());
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
