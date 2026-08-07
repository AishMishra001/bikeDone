package com.bikedone.usermanagement.mechanic.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BasicDetailsRequest {

    @NotBlank(message = "Full name is required.")
    private String fullName;

    @NotBlank(message = "Experience is required.")
    private String experience;

    @NotBlank(message = "Profile photo is required.")
    private String profilePhotoUrl;
}
