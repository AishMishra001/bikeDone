package com.bikedone.order_management_service.controller;

import com.bikedone.order_management_service.common.datetime.DateTimeProvider;
import com.bikedone.order_management_service.common.logging.LogLevel;
import com.bikedone.order_management_service.common.logging.LogStep;
import com.bikedone.order_management_service.common.logging.Logger;
import com.bikedone.order_management_service.common.response.ApiResponse;
import com.bikedone.order_management_service.dto.response.VehicleModelResponse;
import com.bikedone.order_management_service.service.VehicleModelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/vehicle-models")
@RequiredArgsConstructor
public class VehicleModelController {

    private final VehicleModelService vehicleModelService;

    private final DateTimeProvider dateTimeProvider;

    @GetMapping
    public ResponseEntity<ApiResponse<List<VehicleModelResponse>>> getVehicleModels(
            @RequestParam UUID brandId,
            @RequestParam(required = false) UUID itemId
    ) {

        Logger.printLog(
                LogLevel.INFO,
                LogStep.VEHICLE_MODEL,
                "Fetch vehicle models request received",
                "Fetching models for brandId=" + brandId + ", itemId=" + itemId,
                null,
                brandId.toString()
        );

        List<VehicleModelResponse> response =
                vehicleModelService.getVehicleModels(brandId, itemId);

        Logger.printLog(
                LogLevel.INFO,
                LogStep.VEHICLE_MODEL,
                "Vehicle models fetched successfully",
                "Returned " + response.size() + " model(s) for brandId=" + brandId,
                null,
                brandId.toString()
        );

        return ResponseEntity.ok(
                ApiResponse.<List<VehicleModelResponse>>builder()
                        .success(true)
                        .message("Vehicle models fetched successfully.")
                        .data(response)
                        .timestamp(dateTimeProvider.now())
                        .build()
        );
    }
}
