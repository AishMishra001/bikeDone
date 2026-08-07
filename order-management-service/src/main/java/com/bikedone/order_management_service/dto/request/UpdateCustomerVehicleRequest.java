package com.bikedone.order_management_service.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateCustomerVehicleRequest {

    @NotBlank(message = "Color is required.")
    private String color;

    @NotNull(message = "Manufacturing year is required.")
    @Min(value = 1950, message = "Manufacturing year is invalid.")
    private Integer manufacturingYear;

    @NotNull(message = "Odometer reading is required.")
    @Min(value = 0, message = "Odometer reading cannot be negative.")
    private Integer odometerKm;
}