package com.bikedone.usermanagement.service.impl;

import com.bikedone.usermanagement.common.datetime.DateTimeProvider;
import com.bikedone.usermanagement.common.logging.LogLevel;
import com.bikedone.usermanagement.common.logging.LogStep;
import com.bikedone.usermanagement.common.logging.Logger;
import com.bikedone.usermanagement.config.MobileVerificationProperties;
import com.bikedone.usermanagement.entity.MobileVerificationOtp;
import com.bikedone.usermanagement.entity.User;
import com.bikedone.usermanagement.exception.BadRequestException;
import com.bikedone.usermanagement.repository.MobileVerificationOtpRepository;
import com.bikedone.usermanagement.repository.UserRepository;
import com.bikedone.usermanagement.security.authentication.AuthenticationFacade;
import com.bikedone.usermanagement.security.user.UserPrincipal;
import com.bikedone.usermanagement.service.MobileVerificationService;
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
public class MobileVerificationServiceImpl implements MobileVerificationService {

    private final AuthenticationFacade authenticationFacade;

    private final UserRepository userRepository;

    private final MobileVerificationOtpRepository mobileVerificationOtpRepository;

    private final PasswordEncoder passwordEncoder;

    private final OtpGenerator otpGenerator;

    private final SmsService smsService;

    private final DateTimeProvider dateTimeProvider;

    private final MobileVerificationProperties properties;


    @Override
    @Transactional
    public void sendOtp() {

        UserPrincipal principal = authenticationFacade.getCurrentUser();

        User user = userRepository.findUserWithRoleByEmail(principal.getUsername())
                .orElseThrow(() -> new BadRequestException("User not found."));

        Logger.printLog(
                LogLevel.INFO,
                LogStep.AUTH,
                "Mobile verification OTP requested.",
                "User requested mobile verification OTP.",
                user.getId().toString(),
                null
        );

        validateMobileVerificationEligibility(user);

        validateResendCooldown(user);

        mobileVerificationOtpRepository.deleteByUser_Id(user.getId());

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

            throw new BadRequestException(
                    "Unable to send OTP. Please try again later."
            );
        }

        Logger.printLog(
                LogLevel.INFO,
                LogStep.AUTH,
                "Mobile verification OTP sent successfully.",
                "OTP sent successfully.",
                user.getId().toString(),
                entity.getId().toString()
        );
    }

    @Override
    public void resendOtp() {
        sendOtp();
    }

    @Override
    @Transactional
    public void verifyOtp(String otp) {

        UserPrincipal principal = authenticationFacade.getCurrentUser();

        User user = userRepository.findUserWithRoleByEmail(principal.getUsername())
                .orElseThrow(() -> new BadRequestException("User not found."));

        Logger.printLog(
                LogLevel.INFO,
                LogStep.AUTH,
                "Mobile verification OTP verification requested.",
                "User requested mobile verification.",
                user.getId().toString(),
                null
        );

        validateMobileVerificationEligibility(user);

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

                            return new BadRequestException(
                                    "No active OTP found."
                            );
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
                "Mobile verification completed.",
                user.getId().toString(),
                null
        );
    }

    private void validateOtpExpiration(
            MobileVerificationOtp otp
    ) {

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

            throw new BadRequestException(
                    "OTP has expired. Please request a new OTP."
            );
        }

    }

    private void validateOtp(
            User user,
            MobileVerificationOtp entity,
            String enteredOtp
    ) {

        if (passwordEncoder.matches(
                enteredOtp,
                entity.getOtpHash()
        )) {
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

            throw new BadRequestException(
                    "Maximum OTP attempts exceeded. Please request a new OTP."
            );
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

        throw new BadRequestException(
                "Invalid OTP."
        );

    }

    private void validateMobileVerificationEligibility(User user) {

        if (Boolean.TRUE.equals(user.getMobileVerified())) {

            Logger.printLog(
                    LogLevel.WARN,
                    LogStep.AUTH,
                    "Mobile verification skipped.",
                    "Mobile number is already verified.",
                    user.getId().toString(),
                    null
            );

            throw new BadRequestException(
                    "Mobile number is already verified."
            );
        }

        if (user.getMobileNumber() == null ||
                user.getMobileNumber().isBlank()) {

            throw new BadRequestException(
                    "Mobile number is not available."
            );
        }
    }

    private void validateResendCooldown(User user) {

        Optional<MobileVerificationOtp> optionalOtp =
                mobileVerificationOtpRepository.findByUser(user);

        if (optionalOtp.isEmpty()) {
            return;
        }

        MobileVerificationOtp otp = optionalOtp.get();

        LocalDateTime nextAllowedTime =
                otp.getCreatedAt().plusSeconds(
                        properties.getResendCooldownInSeconds()
                );

        if (dateTimeProvider.now().isBefore(nextAllowedTime)) {

            throw new BadRequestException(
                    "Please wait before requesting another OTP."
            );
        }
    }

    private MobileVerificationOtp buildOtpEntity(
            User user,
            String otp
    ) {

        MobileVerificationOtp entity = new MobileVerificationOtp();

        entity.setId(UUID.randomUUID());

        entity.setUser(user);

        entity.setMobileNumber(user.getMobileNumber());

        entity.setOtpHash(passwordEncoder.encode(otp));

        entity.setAttempts(0);

        LocalDateTime now = dateTimeProvider.now();

        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);
        entity.setExpiresAt(
                now.plusMinutes(properties.getExpirationInMinutes())
        );

        return entity;
    }


}
