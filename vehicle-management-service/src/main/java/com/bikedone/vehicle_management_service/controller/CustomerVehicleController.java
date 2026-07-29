package com.bikedone.vehicle_management_service.controller;

import com.bikedone.vehicle_management_service.common.response.ApiResponse;
import com.bikedone.vehicle_management_service.dto.request.CreateCustomerVehicleRequest;
import com.bikedone.vehicle_management_service.dto.response.CustomerVehicleResponse;
import com.bikedone.vehicle_management_service.service.CustomerVehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/customer-vehicles")
@RequiredArgsConstructor
public class CustomerVehicleController {

    private final CustomerVehicleService customerVehicleService;

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerVehicleResponse>> createVehicle(
            @Valid @RequestBody CreateCustomerVehicleRequest request) {

        CustomerVehicleResponse response =
                customerVehicleService.createVehicle(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        response,
                        "Vehicle registered successfully."
                ));
    }
}