package com.bikedone.usermanagement.mechanic.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class PublicMechanicProfileResponse {
    private UUID id;
    private String fullName;
    private String mobileNumber;
    private String profilePhotoUrl;
    private Double rating;
}
