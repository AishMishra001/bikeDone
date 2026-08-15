package com.bikedone.order_management_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceabilityPincodeRequest {

    @NotBlank(message = "Pincode is required")
    @Size(min = 6, max = 10, message = "Pincode must be between 6 and 10 characters")
    private String pincode;

    @NotBlank(message = "Area name is required")
    private String areaName;

    private String city;

    private String state;

    private BigDecimal latitude;

    private BigDecimal longitude;

    private BigDecimal radiusKm;

    @Builder.Default
    private Boolean isActive = true;
}
