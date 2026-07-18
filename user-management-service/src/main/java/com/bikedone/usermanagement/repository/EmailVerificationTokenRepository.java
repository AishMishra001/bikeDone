package com.bikedone.usermanagement.repository;

import com.bikedone.usermanagement.entity.EmailVerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EmailVerificationTokenRepository
        extends JpaRepository<EmailVerificationToken, UUID> {

    Optional<EmailVerificationToken> findByTokenHash(String tokenHash);

    Optional<EmailVerificationToken> findByTokenHashAndVerifiedAtIsNull(String tokenHash);

    void deleteByUser_Id(UUID userId);
}