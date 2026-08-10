package com.bikedone.order_management_service.dto.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;
import java.util.List;

@Getter
@Setter
public class CreateCustomerVehicleRequest {

    @NotNull(message = "Brand Id is required.")
    private UUID brandId;

    @NotNull(message = "Model Id is required.")
    private UUID modelId;

    @NotBlank(message = "Registration number is required.")
    @Size(max = 20)
    private String registrationNumber;

    @Min(1950)
    @Max(2100)
    private Integer manufacturingYear;

    @Size(max = 50)
    private String color;

    @Size(max = 100)
    private String engineNumber;

    @Size(max = 100)
    private String chassisNumber;

    @NotNull
    @Min(0)
    private Integer odometerKm;

    @NotNull
    private Boolean isDefault;

    private List<String> imageUrls;
}