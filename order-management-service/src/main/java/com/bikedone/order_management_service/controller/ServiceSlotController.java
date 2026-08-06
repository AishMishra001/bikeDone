package com.bikedone.order_management_service.controller;

import com.bikedone.order_management_service.common.logging.LogLevel;
import com.bikedone.order_management_service.common.logging.LogStep;
import com.bikedone.order_management_service.common.logging.Logger;
import com.bikedone.order_management_service.common.response.ApiResponse;
import com.bikedone.order_management_service.dto.response.ServiceSlotResponse;
import com.bikedone.order_management_service.service.ServiceSlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/service-slots")
@RequiredArgsConstructor
public class ServiceSlotController {

    private final ServiceSlotService serviceSlotService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ServiceSlotResponse>>> getAllServiceSlots() {

        Logger.printLog(
                LogLevel.INFO,
                LogStep.SERVICE_REQUEST,
                "Fetch all service slots request received",
                "Fetching all active service slots",
                null,
                null
        );

        List<ServiceSlotResponse> response = serviceSlotService.getAllServiceSlots();

        Logger.printLog(
                LogLevel.INFO,
                LogStep.SERVICE_REQUEST,
                "Service slots fetched successfully",
                "Returned " + response.size() + " slot(s)",
                null,
                null
        );

        return ResponseEntity.ok(
                ApiResponse.success(response, "Service slots fetched successfully.")
        );
    }
}
