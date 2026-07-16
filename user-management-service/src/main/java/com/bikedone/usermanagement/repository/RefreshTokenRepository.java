package com.bikedone.usermanagement.repository;

import com.bikedone.usermanagement.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    Optional<RefreshToken> findByTokenHashAndRevokedFalse(String tokenHash);

    List<RefreshToken> findAllByUser_Id(UUID userId);

    List<RefreshToken> findAllByUser_IdAndRevokedFalse(UUID userId);

    boolean existsByTokenHash(String tokenHash);

    void deleteByExpiresAtBefore(LocalDateTime dateTime);

    long deleteByUser_IdAndRevokedTrue(UUID userId);

}