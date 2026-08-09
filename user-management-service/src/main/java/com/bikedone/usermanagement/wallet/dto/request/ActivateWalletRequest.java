package com.bikedone.usermanagement.wallet.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivateWalletRequest {

    @NotBlank(message = "OTP is required for wallet activation")
    private String otp;
}
