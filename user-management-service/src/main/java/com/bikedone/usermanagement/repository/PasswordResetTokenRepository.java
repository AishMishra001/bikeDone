package com.bikedone.usermanagement.repository;

import com.bikedone.usermanagement.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PasswordResetTokenRepository
        extends JpaRepository<PasswordResetToken, UUID> {

    Optional<PasswordResetToken>
    findByTokenHashAndUsedAtIsNull(String tokenHash);

    void deleteByUser_Id(UUID userId);
}