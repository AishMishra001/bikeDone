package com.bikedone.usermanagement.security.token;

import com.bikedone.usermanagement.entity.RefreshToken;
import com.bikedone.usermanagement.entity.User;

import java.util.UUID;

public interface RefreshTokenService {

    RefreshTokenResult createRefreshToken(User user);

    RefreshToken validateRefreshToken(String rawToken);

    void revokeToken(RefreshToken refreshToken);

    void revokeAllUserTokens(UUID userId);
}