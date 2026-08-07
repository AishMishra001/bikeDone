package com.bikedone.order_management_service.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CurrentLocationRequest {

    @NotNull(message = "Current location latitude is required.")
    @DecimalMin(value = "-90.0", message = "Current location latitude must be between -90 and 90.")
    @DecimalMax(value = "90.0", message = "Current location latitude must be between -90 and 90.")
    private BigDecimal latitude;

    @NotNull(message = "Current location longitude is required.")
    @DecimalMin(value = "-180.0", message = "Current location longitude must be between -180 and 180.")
    @DecimalMax(value = "180.0", message = "Current location longitude must be between -180 and 180.")
    private BigDecimal longitude;

    @Size(max = 1000, message = "Current location note cannot exceed 1000 characters.")
    private String note;
}
