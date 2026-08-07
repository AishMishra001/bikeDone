package com.bikedone.usermanagement.mechanic.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SaveBasicDetailsRequest {

    @NotBlank(message = "Full name is required.")
    private String fullName;

    private Integer experienceYears;

    private Boolean hasShop;
}