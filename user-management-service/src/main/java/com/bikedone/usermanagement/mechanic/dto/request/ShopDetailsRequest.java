package com.bikedone.usermanagement.mechanic.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShopDetailsRequest {

    @Builder.Default
    private Boolean hasShop = true;

    @NotBlank(message = "Shop name is compulsory.")
    private String shopName;

    @NotBlank(message = "Shop address is compulsory.")
    private String shopAddress;
}
