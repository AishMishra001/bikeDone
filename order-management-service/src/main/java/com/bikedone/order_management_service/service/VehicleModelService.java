package com.bikedone.order_management_service.service;

import com.bikedone.order_management_service.dto.response.VehicleModelResponse;

import java.util.List;
import java.util.UUID;

public interface VehicleModelService {

    List<VehicleModelResponse> getVehicleModels(UUID brandId);

}