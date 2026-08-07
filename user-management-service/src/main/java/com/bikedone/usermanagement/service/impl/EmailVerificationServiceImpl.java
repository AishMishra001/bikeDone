package com.bikedone.usermanagement.service.impl;

import com.bikedone.usermanagement.common.datetime.DateTimeProvider;
import com.bikedone.usermanagement.common.logging.LogLevel;
import com.bikedone.usermanagement.common.logging.LogStep;
import com.bikedone.usermanagement.common.logging.Logger;
import com.bikedone.usermanagement.config.EmailProperties;
import com.bikedone.usermanagement.config.JwtProperties;
import com.bikedone.usermanagement.dto.request.ResendEmailVerificationRequest;
import com.bikedone.usermanagement.entity.EmailVerificationToken;
import com.bikedone.usermanagement.entity.User;
import com.bikedone.usermanagement.exception.BadRequestException;
import com.bikedone.usermanagement.repository.EmailVerificationTokenRepository;
import com.bikedone.usermanagement.repository.UserRepository;
import com.bikedone.usermanagement.security.authentication.AuthenticationFacade;
import com.bikedone.usermanagement.security.token.RefreshTokenGenerator;
import com.bikedone.usermanagement.security.token.TokenHasher;
import com.bikedone.usermanagement.security.user.UserPrincipal;
import com.bikedone.usermanagement.service.EmailService;
import com.bikedone.usermanagement.service.EmailVerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailVerificationServiceImpl implements EmailVerificationService {

    private final AuthenticationFacade authenticationFacade;

    private final UserRepository userRepository;

    private final EmailVerificationTokenRepository emailVerificationTokenRepository;

    private final RefreshTokenGenerator refreshTokenGenerator;

    private final TokenHasher tokenHasher;

    private final DateTimeProvider dateTimeProvider;

    private final JwtProperties jwtProperties;

    private final EmailProperties emailProperties;

    private final EmailService emailService;

    @Override
    @Transactional
    public void sendVerificationEmail() {

        UserPrincipal principal = authenticationFacade.getCurrentUser();

        User user = userRepository.findUserWithRoleByEmail(principal.getUsername())
                .orElseThrow(() -> new BadRequestException("User not found."));

        sendVerificationEmail(user);

    }

    @Override
    @Transactional
    public void verifyEmail(String token) {

        String tokenHash = tokenHasher.hash(token);

        EmailVerificationToken verificationToken =
                emailVerificationTokenRepository
                        .findByTokenHashAndVerifiedAtIsNull(tokenHash)
                        .orElseThrow(() ->
                                new BadRequestException("Invalid verification token."));

        if (verificationToken.isExpired(dateTimeProvider.now())) {
            throw new BadRequestException("Verification token has expired.");
        }

        User user = verificationToken.getUser();

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new BadRequestException("Email is already verified.");
        }

        user.setEmailVerified(true);

        verificationToken.markVerified(dateTimeProvider.now());

        userRepository.save(user);

        emailService.sendWelcomeEmail(
                user.getEmail(),
                user.getFirstName()
        );

        log.info("Email verified successfully for userId={}", user.getId());
    }

    @Override
    @Transactional
    public void sendVerificationEmail(User user) {

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new BadRequestException("Email is already verified.");
        }

        emailVerificationTokenRepository.deleteByUser_Id(user.getId());

        String rawToken = refreshTokenGenerator.generate();
        String tokenHash = tokenHasher.hash(rawToken);

        var now = dateTimeProvider.now();

        EmailVerificationToken verificationToken = new EmailVerificationToken();
        verificationToken.setUser(user);
        verificationToken.setTokenHash(tokenHash);
        verificationToken.setCreatedAt(now);
        verificationToken.setExpiresAt(
                now.plus(Duration.ofMillis(jwtProperties.getEmailVerificationTokenExpiration()))
        );

        emailVerificationTokenRepository.save(verificationToken);

        String verificationUrl =
                emailProperties.buildUrl("verify-email?token=" + rawToken);

        emailService.sendVerificationEmail(
                user.getEmail(),
                user.getFirstName(),
                verificationUrl
        );

        log.info("Email verification token generated for userId={}", user.getId());
    }

    @Override
    @Transactional
    public void resendVerificationEmail(ResendEmailVerificationRequest request) {

        Logger.printLog(
                LogLevel.INFO,
                LogStep.AUTH,
                "Resend email verification requested",
                request.getEmail(),
                null,
                null
        );

        User user = userRepository.findUserWithRoleByEmail(request.getEmail())
                .orElseThrow(() -> {

                    Logger.printLog(
                            LogLevel.WARN,
                            LogStep.AUTH,
                            "Resend verification failed",
                            "User not found",
                            null,
                            null
                    );

                    return new BadRequestException("User not found.");
                });

        if (Boolean.TRUE.equals(user.getEmailVerified())) {

            Logger.printLog(
                    LogLevel.WARN,
                    LogStep.AUTH,
                    "Resend verification skipped",
                    "Email already verified",
                    user.getId().toString(),
                    null
            );

            throw new BadRequestException("Email is already verified.");
        }

        sendVerificationEmail(user);

        Logger.printLog(
                LogLevel.INFO,
                LogStep.AUTH,
                "Verification email resent successfully",
                "Verification email sent",
                user.getId().toString(),
                null
        );
    }

}