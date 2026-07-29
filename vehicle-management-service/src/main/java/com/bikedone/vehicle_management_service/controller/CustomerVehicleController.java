package com.bikedone.vehicle_management_service.controller;

import com.bikedone.vehicle_management_service.common.response.ApiResponse;
import com.bikedone.vehicle_management_service.dto.request.CreateCustomerVehicleRequest;
import com.bikedone.vehicle_management_service.dto.request.UpdateCustomerVehicleRequest;
import com.bikedone.vehicle_management_service.dto.response.CustomerVehicleResponse;
import com.bikedone.vehicle_management_service.service.CustomerVehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

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

    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomerVehicleResponse>>> getMyVehicles() {

        List<CustomerVehicleResponse> response = customerVehicleService.getMyVehicles();

        return ResponseEntity.ok(
                ApiResponse.success(response, "Vehicles fetched successfully.")
        );
    }

    @GetMapping("/{vehicleId}")
    public ResponseEntity<ApiResponse<CustomerVehicleResponse>> getVehicleById(
            @PathVariable UUID vehicleId) {

        CustomerVehicleResponse response = customerVehicleService.getVehicleById(vehicleId);

        return ResponseEntity.ok(
                ApiResponse.success(response, "Vehicle details fetched successfully.")
        );
    }

    @PutMapping("/{vehicleId}")
    public ResponseEntity<ApiResponse<CustomerVehicleResponse>> updateVehicle(
            @PathVariable UUID vehicleId,
            @Valid @RequestBody UpdateCustomerVehicleRequest request) {

        CustomerVehicleResponse response = customerVehicleService.updateVehicle(vehicleId, request);

        return ResponseEntity.ok(
                ApiResponse.success(response, "Vehicle updated successfully.")
        );
    }

    @PatchMapping("/{vehicleId}/default")
    public ResponseEntity<ApiResponse<CustomerVehicleResponse>> setDefaultVehicle(
            @PathVariable UUID vehicleId) {

        CustomerVehicleResponse response = customerVehicleService.setDefaultVehicle(vehicleId);

        return ResponseEntity.ok(
                ApiResponse.success(response, "Default vehicle updated successfully.")
        );
    }

    @DeleteMapping("/{vehicleId}")
    public ResponseEntity<ApiResponse<Void>> deleteVehicle(
            @PathVariable UUID vehicleId) {

        customerVehicleService.deleteVehicle(vehicleId);

        return ResponseEntity.ok(
                ApiResponse.success(null, "Vehicle deleted successfully.")
        );
    }
}