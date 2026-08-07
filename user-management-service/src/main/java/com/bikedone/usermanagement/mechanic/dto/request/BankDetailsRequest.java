package com.bikedone.usermanagement.mechanic.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BankDetailsRequest {

    @NotBlank(message = "Account holder name is required.")
    private String accountHolderName;

    @NotBlank(message = "Account number is required.")
    private String accountNumber;

    @NotBlank(message = "IFSC code is required.")
    private String ifscCode;

    @NotBlank(message = "Bank name is required.")
    private String bankName;
}
