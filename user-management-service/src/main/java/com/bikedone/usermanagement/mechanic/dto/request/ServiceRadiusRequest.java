package com.bikedone.usermanagement.mechanic.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ServiceRadiusRequest {

    @NotNull(message = "Service radius is required.")
    @Min(value = 1, message = "Radius must be at least 1 KM.")
    @Max(value = 30, message = "Radius cannot exceed 30 KM.")
    private Integer radiusKm;
}
