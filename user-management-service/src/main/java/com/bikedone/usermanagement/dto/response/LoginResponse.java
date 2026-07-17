package com.bikedone.usermanagement.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponse {

    private String accessToken;

    private String refreshToken;

    private String tokenType;

    /**
     * Access Token Expiry (in milliseconds)
     */
    private Long accessTokenExpiresIn;

    /**
     * Refresh Token Expiry (in milliseconds)
     */
    private Long refreshTokenExpiresIn;

    private UserLoginResponse user;

}