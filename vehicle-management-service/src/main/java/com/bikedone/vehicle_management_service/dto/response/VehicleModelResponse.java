package com.bikedone.vehicle_management_service.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class VehicleModelResponse {

    private UUID id;

    private String modelName;

    private String modelCode;

    private String fuelType;

    private String transmissionType;

    private Integer engineCapacityCc;

    private String logoUrl;
}