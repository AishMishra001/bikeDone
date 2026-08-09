package com.bikedone.usermanagement.mechanic.repository;

import com.bikedone.usermanagement.mechanic.entity.MechanicRefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MechanicRefreshTokenRepository extends JpaRepository<MechanicRefreshToken, UUID> {

    Optional<MechanicRefreshToken> findByTokenHashAndRevokedFalse(String tokenHash);

    List<MechanicRefreshToken> findAllByMechanic_IdAndRevokedFalse(UUID mechanicId);
}
