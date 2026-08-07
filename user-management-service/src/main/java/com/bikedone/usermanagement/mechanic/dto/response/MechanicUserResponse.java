package com.bikedone.usermanagement.mechanic.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class MechanicUserResponse {

    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String mobileNumber;
    private String status;
    private Boolean mobileVerified;
    private Boolean isBlocked;
}
