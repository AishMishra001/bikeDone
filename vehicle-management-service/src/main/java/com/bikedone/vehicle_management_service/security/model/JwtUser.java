package com.bikedone.vehicle_management_service.security.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
@AllArgsConstructor
public class JwtUser {

    private UUID userId;

    private String email;

    private String role;

}