package com.bikedone.usermanagement.service.impl;

import com.bikedone.usermanagement.common.datetime.DateTimeProvider;
import com.bikedone.usermanagement.config.EmailProperties;
import com.bikedone.usermanagement.config.JwtProperties;
import com.bikedone.usermanagement.dto.request.ResetPasswordRequest;
import com.bikedone.usermanagement.exception.BadRequestException;
import com.bikedone.usermanagement.repository.PasswordResetTokenRepository;
import com.bikedone.usermanagement.repository.UserRepository;
import com.bikedone.usermanagement.security.token.RefreshTokenGenerator;
import com.bikedone.usermanagement.security.token.RefreshTokenService;
import com.bikedone.usermanagement.security.token.TokenHasher;
import com.bikedone.usermanagement.service.EmailService;
import com.bikedone.usermanagement.service.PasswordResetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.bikedone.usermanagement.entity.User;
import com.bikedone.usermanagement.entity.PasswordResetToken;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetServiceImpl implements PasswordResetService {

    private final UserRepository userRepository;

    private final PasswordResetTokenRepository passwordResetTokenRepository;

    private final RefreshTokenGenerator refreshTokenGenerator;

    private final TokenHasher tokenHasher;

    private final DateTimeProvider dateTimeProvider;

    private final JwtProperties jwtProperties;

    private final PasswordEncoder passwordEncoder;

    private final RefreshTokenService refreshTokenService;

    private final EmailProperties emailProperties;

    private final EmailService emailService;


    @Override
    @Transactional
    public void forgotPassword(String email) {

        User user = userRepository.findUserWithRoleByEmail(email).orElse(null);

        if (user == null) {
            log.info("Password reset requested for non-existing email: {}", email);
            return;
        }

        passwordResetTokenRepository.deleteByUser_Id(user.getId());

        String rawToken = refreshTokenGenerator.generate();

        String tokenHash = tokenHasher.hash(rawToken);

        LocalDateTime now = dateTimeProvider.now();

        PasswordResetToken passwordResetToken = new PasswordResetToken();
        passwordResetToken.setUser(user);
        passwordResetToken.setTokenHash(tokenHash);
        passwordResetToken.setCreatedAt(now);
        passwordResetToken.setExpiresAt(
                now.plus(Duration.ofMillis(jwtProperties.getPasswordResetTokenExpiration()))
        );

        passwordResetTokenRepository.save(passwordResetToken);

        // TODO: Replace with Brevo email
        // log.debug("Password Reset Token : {}", rawToken);

        String resetUrl =
                emailProperties.getFrontendUrl()
                        + "/reset-password?token=" + rawToken;

        emailService.sendPasswordResetEmail(
                user.getEmail(),
                user.getFirstName(),
                resetUrl
        );

        log.info("Password reset token generated successfully for user: {}", user.getEmail());
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New password and confirm password do not match.");
        }

        // Reuse your existing validator (if available)
        // passwordPolicyValidator.validate(request.getNewPassword());

        String tokenHash = tokenHasher.hash(request.getToken());

        PasswordResetToken passwordResetToken = passwordResetTokenRepository
                .findByTokenHashAndUsedAtIsNull(tokenHash)
                .orElseThrow(() ->
                        new BadRequestException("Invalid password reset token."));

        LocalDateTime now = dateTimeProvider.now();

        if (passwordResetToken.isExpired(now)) {
            throw new BadRequestException("Password reset token has expired.");
        }

        User user = passwordResetToken.getUser();

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new BadRequestException("New password cannot be the same as the current password.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));

        passwordResetToken.markUsed(now);

        // Revoke all active refresh tokens after password change
        refreshTokenService.revokeAllUserTokens(user.getId());

        userRepository.save(user);

        log.info("Password reset successfully for user: {}", user.getEmail());
    }

}