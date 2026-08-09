package com.bikedone.usermanagement.mechanic.service.impl;

import com.bikedone.usermanagement.common.datetime.DateTimeProvider;
import com.bikedone.usermanagement.config.JwtProperties;
import com.bikedone.usermanagement.exception.BadRequestException;
import com.bikedone.usermanagement.mechanic.entity.MechanicRefreshToken;
import com.bikedone.usermanagement.mechanic.entity.MechanicUser;
import com.bikedone.usermanagement.mechanic.repository.MechanicRefreshTokenRepository;
import com.bikedone.usermanagement.mechanic.service.MechanicRefreshTokenResult;
import com.bikedone.usermanagement.mechanic.service.MechanicRefreshTokenService;
import com.bikedone.usermanagement.security.token.RefreshTokenGenerator;
import com.bikedone.usermanagement.security.token.TokenHasher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MechanicRefreshTokenServiceImpl implements MechanicRefreshTokenService {

    private final MechanicRefreshTokenRepository refreshTokenRepository;
    private final RefreshTokenGenerator refreshTokenGenerator;
    private final TokenHasher tokenHasher;
    private final JwtProperties jwtProperties;
    private final DateTimeProvider dateTimeProvider;

    @Override
    public MechanicRefreshTokenResult generateRefreshToken(MechanicUser mechanic, String deviceId, String deviceName, String ipAddress, String userAgent) {
        String rawToken = refreshTokenGenerator.generate();
        String tokenHash = tokenHasher.hash(rawToken);

        LocalDateTime now = dateTimeProvider.now();
        LocalDateTime expiresAt = now.plusSeconds(jwtProperties.getRefreshTokenExpiration() / 1000);

        MechanicRefreshToken refreshToken = new MechanicRefreshToken();
        refreshToken.setMechanic(mechanic);
        refreshToken.setTokenHash(tokenHash);
        refreshToken.setDeviceId(deviceId);
        refreshToken.setDeviceName(deviceName);
        refreshToken.setIpAddress(ipAddress);
        refreshToken.setUserAgent(userAgent);
        refreshToken.setExpiresAt(expiresAt);
        refreshToken.setRevoked(false);

        MechanicRefreshToken savedToken = refreshTokenRepository.save(refreshToken);
        return new MechanicRefreshTokenResult(rawToken, savedToken);
    }

    @Override
    public MechanicRefreshTokenResult rotateRefreshToken(MechanicRefreshToken existingRefreshToken) {
        String rawToken = refreshTokenGenerator.generate();
        String tokenHash = tokenHasher.hash(rawToken);

        existingRefreshToken.setTokenHash(tokenHash);
        existingRefreshToken.setExpiresAt(
                dateTimeProvider.now()
                        .plusSeconds(jwtProperties.getRefreshTokenExpiration() / 1000)
        );
        existingRefreshToken.setLastUsedAt(dateTimeProvider.now());
        existingRefreshToken.setRevoked(false);
        existingRefreshToken.setRevokedAt(null);

        MechanicRefreshToken savedToken = refreshTokenRepository.save(existingRefreshToken);
        return new MechanicRefreshTokenResult(rawToken, savedToken);
    }

    @Override
    public MechanicRefreshToken validateRefreshToken(String rawToken) {
        String tokenHash = tokenHasher.hash(rawToken);

        MechanicRefreshToken refreshToken = refreshTokenRepository
                .findByTokenHashAndRevokedFalse(tokenHash)
                .orElseThrow(() -> new BadRequestException("Invalid refresh token."));

        if (refreshToken.isExpired(dateTimeProvider.now())) {
            throw new BadRequestException("Refresh token has expired.");
        }

        refreshToken.markAsUsed(dateTimeProvider.now());
        return refreshTokenRepository.save(refreshToken);
    }

    @Override
    public void revokeToken(MechanicRefreshToken refreshToken) {
        refreshToken.revoke(dateTimeProvider.now());
        refreshTokenRepository.save(refreshToken);
    }

    @Override
    public void revokeAllUserTokens(UUID mechanicId) {
        refreshTokenRepository
                .findAllByMechanic_IdAndRevokedFalse(mechanicId)
                .forEach(token -> {
                    token.revoke(dateTimeProvider.now());
                    refreshTokenRepository.save(token);
                });
    }
}
