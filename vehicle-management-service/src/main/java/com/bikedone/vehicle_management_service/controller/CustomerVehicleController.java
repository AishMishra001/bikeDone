package com.bikedone.vehicle_management_service.controller;

import com.bikedone.vehicle_management_service.common.logging.LogLevel;
import com.bikedone.vehicle_management_service.common.logging.LogStep;
import com.bikedone.vehicle_management_service.common.logging.Logger;
import com.bikedone.vehicle_management_service.common.response.ApiResponse;
import com.bikedone.vehicle_management_service.dto.request.CreateCustomerVehicleRequest;
import com.bikedone.vehicle_management_service.dto.request.UpdateCustomerVehicleRequest;
import com.bikedone.vehicle_management_service.dto.response.CustomerVehicleResponse;
import com.bikedone.vehicle_management_service.exception.BadRequestException;
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

        Logger.printLog(
                LogLevel.INFO,
                LogStep.CUSTOMER_VEHICLE,
                "Create vehicle request received",
                "Registering new vehicle with registrationNumber=" + request.getRegistrationNumber(),
                null,
                null
        );

        try {
            CustomerVehicleResponse response =
                    customerVehicleService.createVehicle(request);

            Logger.printLog(
                    LogLevel.INFO,
                    LogStep.CUSTOMER_VEHICLE,
                    "Vehicle registered successfully",
                    "vehicleId=" + response.getId(),
                    null,
                    response.getId() != null ? response.getId().toString() : null
            );

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(
                            response,
                            "Vehicle registered successfully."
                    ));
        } catch (Exception e) {
            Logger.printLog(
                    LogLevel.ERROR,
                    LogStep.CUSTOMER_VEHICLE,
                    "Create vehicle failed",
                    e.getMessage(),
                    null,
                    null
            );
            throw new BadRequestException(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomerVehicleResponse>>> getMyVehicles() {

        Logger.printLog(
                LogLevel.INFO,
                LogStep.CUSTOMER_VEHICLE,
                "Fetch my vehicles request received",
                "Fetching all active vehicles for authenticated user",
                null,
                null
        );

        try {
            List<CustomerVehicleResponse> response = customerVehicleService.getMyVehicles();

            Logger.printLog(
                    LogLevel.INFO,
                    LogStep.CUSTOMER_VEHICLE,
                    "Vehicles fetched successfully",
                    "Returned " + response.size() + " vehicle(s)",
                    null,
                    null
            );

            return ResponseEntity.ok(
                    ApiResponse.success(response, "Vehicles fetched successfully.")
            );
        } catch (Exception e) {
            Logger.printLog(
                    LogLevel.ERROR,
                    LogStep.CUSTOMER_VEHICLE,
                    "Fetch vehicles failed",
                    e.getMessage(),
                    null,
                    null
            );
            throw new BadRequestException(e.getMessage());
        }
    }

    @GetMapping("/{vehicleId}")
    public ResponseEntity<ApiResponse<CustomerVehicleResponse>> getVehicleById(
            @PathVariable UUID vehicleId) {

        Logger.printLog(
                LogLevel.INFO,
                LogStep.CUSTOMER_VEHICLE,
                "Get vehicle by ID request received",
                "Fetching vehicle details for vehicleId=" + vehicleId,
                null,
                vehicleId.toString()
        );

        try {
            CustomerVehicleResponse response = customerVehicleService.getVehicleById(vehicleId);

            Logger.printLog(
                    LogLevel.INFO,
                    LogStep.CUSTOMER_VEHICLE,
                    "Vehicle details fetched successfully",
                    "vehicleId=" + vehicleId,
                    null,
                    vehicleId.toString()
            );

            return ResponseEntity.ok(
                    ApiResponse.success(response, "Vehicle details fetched successfully.")
            );
        } catch (Exception e) {
            Logger.printLog(
                    LogLevel.ERROR,
                    LogStep.CUSTOMER_VEHICLE,
                    "Get vehicle by ID failed",
                    e.getMessage(),
                    null,
                    vehicleId.toString()
            );
            throw new BadRequestException(e.getMessage());
        }
    }

    @PutMapping("/{vehicleId}")
    public ResponseEntity<ApiResponse<CustomerVehicleResponse>> updateVehicle(
            @PathVariable UUID vehicleId,
            @Valid @RequestBody UpdateCustomerVehicleRequest request) {

        Logger.printLog(
                LogLevel.INFO,
                LogStep.CUSTOMER_VEHICLE,
                "Update vehicle request received",
                "Updating vehicle with vehicleId=" + vehicleId,
                null,
                vehicleId.toString()
        );

        try {
            CustomerVehicleResponse response = customerVehicleService.updateVehicle(vehicleId, request);

            Logger.printLog(
                    LogLevel.INFO,
                    LogStep.CUSTOMER_VEHICLE,
                    "Vehicle updated successfully",
                    "vehicleId=" + vehicleId,
                    null,
                    vehicleId.toString()
            );

            return ResponseEntity.ok(
                    ApiResponse.success(response, "Vehicle updated successfully.")
            );
        } catch (Exception e) {
            Logger.printLog(
                    LogLevel.ERROR,
                    LogStep.CUSTOMER_VEHICLE,
                    "Update vehicle failed",
                    e.getMessage(),
                    null,
                    vehicleId.toString()
            );
            throw new BadRequestException(e.getMessage());
        }
    }

    @PatchMapping("/{vehicleId}/default")
    public ResponseEntity<ApiResponse<CustomerVehicleResponse>> setDefaultVehicle(
            @PathVariable UUID vehicleId) {

        Logger.printLog(
                LogLevel.INFO,
                LogStep.CUSTOMER_VEHICLE,
                "Set default vehicle request received",
                "Setting vehicleId=" + vehicleId + " as default",
                null,
                vehicleId.toString()
        );

        try {
            CustomerVehicleResponse response = customerVehicleService.setDefaultVehicle(vehicleId);

            Logger.printLog(
                    LogLevel.INFO,
                    LogStep.CUSTOMER_VEHICLE,
                    "Default vehicle updated successfully",
                    "vehicleId=" + vehicleId,
                    null,
                    vehicleId.toString()
            );

            return ResponseEntity.ok(
                    ApiResponse.success(response, "Default vehicle updated successfully.")
            );
        } catch (Exception e) {
            Logger.printLog(
                    LogLevel.ERROR,
                    LogStep.CUSTOMER_VEHICLE,
                    "Set default vehicle failed",
                    e.getMessage(),
                    null,
                    vehicleId.toString()
            );
            throw new BadRequestException(e.getMessage());
        }
    }

    @DeleteMapping("/{vehicleId}")
    public ResponseEntity<ApiResponse<Void>> deleteVehicle(
            @PathVariable UUID vehicleId) {

        Logger.printLog(
                LogLevel.INFO,
                LogStep.CUSTOMER_VEHICLE,
                "Delete vehicle request received",
                "Deleting vehicleId=" + vehicleId,
                null,
                vehicleId.toString()
        );

        try {
            customerVehicleService.deleteVehicle(vehicleId);

            Logger.printLog(
                    LogLevel.INFO,
                    LogStep.CUSTOMER_VEHICLE,
                    "Vehicle deleted successfully",
                    "vehicleId=" + vehicleId,
                    null,
                    vehicleId.toString()
            );

            return ResponseEntity.ok(
                    ApiResponse.success(null, "Vehicle deleted successfully.")
            );
        } catch (Exception e) {
            Logger.printLog(
                    LogLevel.ERROR,
                    LogStep.CUSTOMER_VEHICLE,
                    "Delete vehicle failed",
                    e.getMessage(),
                    null,
                    vehicleId.toString()
            );
            throw new BadRequestException(e.getMessage());
        }
    }
}
