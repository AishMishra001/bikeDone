package com.bikedone.usermanagement.security.token;


import com.bikedone.usermanagement.entity.RefreshToken;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RefreshTokenResult {

    private final String rawToken;

    private final RefreshToken refreshToken;

}