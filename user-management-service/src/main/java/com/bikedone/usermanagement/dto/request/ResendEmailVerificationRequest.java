package com.bikedone.usermanagement.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResendEmailVerificationRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email address")
    private String email;

}