package com.bikedone.usermanagement.mechanic.service;

import com.bikedone.usermanagement.mechanic.entity.MechanicRefreshToken;
import com.bikedone.usermanagement.mechanic.entity.MechanicUser;

import java.util.UUID;

public interface MechanicRefreshTokenService {

    MechanicRefreshTokenResult generateRefreshToken(MechanicUser mechanic, String deviceId, String deviceName, String ipAddress, String userAgent);

    MechanicRefreshTokenResult rotateRefreshToken(MechanicRefreshToken existingRefreshToken);

    MechanicRefreshToken validateRefreshToken(String rawToken);

    void revokeToken(MechanicRefreshToken refreshToken);

    void revokeAllUserTokens(UUID mechanicId);
}
