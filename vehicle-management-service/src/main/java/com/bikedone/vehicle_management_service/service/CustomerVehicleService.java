package com.bikedone.vehicle_management_service.service;

import com.bikedone.vehicle_management_service.dto.request.CreateCustomerVehicleRequest;
import com.bikedone.vehicle_management_service.dto.request.UpdateCustomerVehicleRequest;
import com.bikedone.vehicle_management_service.dto.response.CustomerVehicleResponse;

import java.util.List;
import java.util.UUID;

public interface CustomerVehicleService {

    CustomerVehicleResponse createVehicle(CreateCustomerVehicleRequest request);

    List<CustomerVehicleResponse> getMyVehicles();

    CustomerVehicleResponse getVehicleById(UUID vehicleId);

    CustomerVehicleResponse updateVehicle(
            UUID vehicleId,
            UpdateCustomerVehicleRequest request
    );

    CustomerVehicleResponse setDefaultVehicle(UUID vehicleId);
}