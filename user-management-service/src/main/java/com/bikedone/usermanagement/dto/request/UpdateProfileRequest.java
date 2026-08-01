package com.bikedone.usermanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProfileRequest {

    @NotBlank(message = "First name is required.")
    private String firstName;

    private String lastName;

    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid Mobile Number")
    private String mobileNumber;
}