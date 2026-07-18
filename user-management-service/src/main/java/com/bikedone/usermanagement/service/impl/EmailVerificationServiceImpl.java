package com.bikedone.usermanagement.service.impl;

import com.bikedone.usermanagement.common.datetime.DateTimeProvider;
import com.bikedone.usermanagement.config.JwtProperties;
import com.bikedone.usermanagement.entity.EmailVerificationToken;
import com.bikedone.usermanagement.entity.User;
import com.bikedone.usermanagement.exception.BadRequestException;
import com.bikedone.usermanagement.repository.EmailVerificationTokenRepository;
import com.bikedone.usermanagement.repository.UserRepository;
import com.bikedone.usermanagement.security.authentication.AuthenticationFacade;
import com.bikedone.usermanagement.security.token.RefreshTokenGenerator;
import com.bikedone.usermanagement.security.token.TokenHasher;
import com.bikedone.usermanagement.security.user.UserPrincipal;
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

    @Override
    @Transactional
    public void sendVerificationEmail() {

        UserPrincipal principal = authenticationFacade.getCurrentUser();

        User user = userRepository.findUserWithRoleByEmail(principal.getUsername())
                .orElseThrow(() -> new BadRequestException("User not found."));

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

        log.info("Email verification token generated for userId={}", user.getId());
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

        log.info("Email verified successfully for userId={}", user.getId());
    }

}