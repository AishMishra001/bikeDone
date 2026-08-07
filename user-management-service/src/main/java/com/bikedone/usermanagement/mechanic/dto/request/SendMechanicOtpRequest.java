package com.bikedone.usermanagement.mechanic.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class SendMechanicOtpRequest {

    @NotBlank(message = "Mobile number is required.")
    @Pattern(
            regexp = "^[6-9]\\d{9}$",
            message = "Mobile number must be a valid 10-digit Indian phone number."
    )
    private String mobileNumber;
}
