package com.bikedone.vehicle_management_service.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CustomerVehicleResponse {

    private UUID id;

    private String brandName;

    private String modelName;

    private String registrationNumber;

    private Integer manufacturingYear;

    private String color;

    private Integer odometerKm;

    private Boolean isDefault;

}