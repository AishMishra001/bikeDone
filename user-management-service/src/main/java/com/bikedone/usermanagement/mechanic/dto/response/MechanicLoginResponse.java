package com.bikedone.usermanagement.mechanic.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MechanicLoginResponse {

    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private Long accessTokenExpiresIn;
    private Long refreshTokenExpiresIn;
    private MechanicUserResponse mechanic;
}
