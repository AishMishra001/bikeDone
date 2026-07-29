package com.bikedone.vehicle_management_service.service;

import com.bikedone.vehicle_management_service.dto.request.CreateCustomerVehicleRequest;
import com.bikedone.vehicle_management_service.dto.response.CustomerVehicleResponse;

public interface CustomerVehicleService {

    CustomerVehicleResponse createVehicle(
            CreateCustomerVehicleRequest request);

}