package com.bikedone.vehicle_management_service.controller;

import com.bikedone.vehicle_management_service.common.datetime.DateTimeProvider;
import com.bikedone.vehicle_management_service.common.response.ApiResponse;
import com.bikedone.vehicle_management_service.dto.response.VehicleModelResponse;
import com.bikedone.vehicle_management_service.service.VehicleModelService;
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
            @RequestParam UUID brandId
    ) {

        List<VehicleModelResponse> response =
                vehicleModelService.getVehicleModels(brandId);

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