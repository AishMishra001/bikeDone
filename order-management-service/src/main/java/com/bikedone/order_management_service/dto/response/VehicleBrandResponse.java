package com.bikedone.order_management_service.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class VehicleBrandResponse {

    private UUID id;

    private String brandName;

    private String brandCode;

    private String logoUrl;

    private Boolean isActive;

}