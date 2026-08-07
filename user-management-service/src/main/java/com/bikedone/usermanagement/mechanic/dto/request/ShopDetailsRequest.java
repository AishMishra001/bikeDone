package com.bikedone.usermanagement.mechanic.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ShopDetailsRequest {

    @NotNull(message = "hasShop field is required.")
    private Boolean hasShop;

    private String shopName;
    private String shopAddress;
}
