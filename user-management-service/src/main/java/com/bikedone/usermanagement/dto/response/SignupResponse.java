package com.bikedone.usermanagement.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class SignupResponse {

    private UUID userId;

    private String firstName;

    private String email;

}