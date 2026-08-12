package com.bikedone.order_management_service.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;
import java.util.Map;

@Getter
@Setter
public class CustomerVehicleResponse {

    private UUID id;

    private UUID itemId;

    private String itemCode;

    private String itemDisplayName;

    private String brandName;

    private String modelName;

    private String registrationNumber;

    private Integer manufacturingYear;

    private String color;

    private Integer odometerKm;

    private Boolean isDefault;

    private Map<String, Object> vehicleData;

}