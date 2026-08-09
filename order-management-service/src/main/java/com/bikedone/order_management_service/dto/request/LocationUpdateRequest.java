package com.bikedone.order_management_service.dto.request;

import lombok.Data;

@Data
public class LocationUpdateRequest {
    private double latitude;
    private double longitude;
}
