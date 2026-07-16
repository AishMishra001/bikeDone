package com.bikedone.usermanagement.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class UserLoginResponse {

    private UUID id;

    private String firstName;

    private String lastName;

    private String email;

    private String mobileNumber;

    private String role;

}