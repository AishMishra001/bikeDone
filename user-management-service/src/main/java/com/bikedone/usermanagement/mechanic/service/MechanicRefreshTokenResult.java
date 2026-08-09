package com.bikedone.usermanagement.mechanic.service;

import com.bikedone.usermanagement.mechanic.entity.MechanicRefreshToken;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MechanicRefreshTokenResult {

    private final String rawToken;

    private final MechanicRefreshToken refreshToken;

}
