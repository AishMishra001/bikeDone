package com.bikedone.order_management_service.controller;

import com.bikedone.order_management_service.common.datetime.DateTimeProvider;
import com.bikedone.order_management_service.common.logging.LogLevel;
import com.bikedone.order_management_service.common.logging.LogStep;
import com.bikedone.order_management_service.common.logging.Logger;
import com.bikedone.order_management_service.common.response.ApiResponse;
import com.bikedone.order_management_service.dto.response.VehicleBrandResponse;
import com.bikedone.order_management_service.security.authentication.AuthenticationFacade;
import com.bikedone.order_management_service.security.model.JwtUser;
import com.bikedone.order_management_service.service.VehicleBrandService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/vehicle-brands")
@RequiredArgsConstructor
public class VehicleBrandController {

    private final VehicleBrandService vehicleBrandService;

    private final DateTimeProvider dateTimeProvider;

    private final AuthenticationFacade authenticationFacade;

    @GetMapping
    public ResponseEntity<ApiResponse<List<VehicleBrandResponse>>> getAllBrands() {

        Logger.printLog(
                LogLevel.INFO,
                LogStep.VEHICLE_BRAND,
                "Fetch all vehicle brands request received",
                "Fetching all active vehicle brands",
                null,
                null
        );

        List<VehicleBrandResponse> response = vehicleBrandService.getAllBrands();

        Logger.printLog(
                LogLevel.INFO,
                LogStep.VEHICLE_BRAND,
                "Vehicle brands fetched successfully",
                "Returned " + response.size() + " brand(s)",
                null,
                null
        );

        return ResponseEntity.ok(
                ApiResponse.<List<VehicleBrandResponse>>builder()
                        .success(true)
                        .message("Vehicle brands fetched successfully.")
                        .data(response)
                        .timestamp(dateTimeProvider.now())
                        .build()
        );
    }

    @GetMapping("/me")
    public ApiResponse<Object> currentUser() {

        JwtUser user = authenticationFacade.getCurrentUser();

        Logger.printLog(
                LogLevel.INFO,
                LogStep.VEHICLE_BRAND,
                "Current user info fetched",
                "userId=" + user.getUserId(),
                user.getUserId() != null ? user.getUserId().toString() : null,
                null
        );

        return ApiResponse.builder()
                .success(true)
                .message("Current User")
                .data(user)
                .build();
    }
}
