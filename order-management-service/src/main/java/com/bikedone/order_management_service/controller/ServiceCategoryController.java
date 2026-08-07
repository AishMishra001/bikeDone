package com.bikedone.order_management_service.controller;

import com.bikedone.order_management_service.common.datetime.DateTimeProvider;
import com.bikedone.order_management_service.common.logging.LogLevel;
import com.bikedone.order_management_service.common.logging.LogStep;
import com.bikedone.order_management_service.common.logging.Logger;
import com.bikedone.order_management_service.common.response.ApiResponse;
import com.bikedone.order_management_service.dto.response.ServiceCategoryResponse;
import com.bikedone.order_management_service.service.ServiceCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/service-categories")
@RequiredArgsConstructor
public class ServiceCategoryController {

    private final ServiceCategoryService serviceCategoryService;

    private final DateTimeProvider dateTimeProvider;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ServiceCategoryResponse>>> getAllServiceCategories() {

        Logger.printLog(
                LogLevel.INFO,
                LogStep.SERVICE_CATEGORY,
                "Fetch all service categories request received",
                "Fetching all active service categories",
                null,
                null
        );

        List<ServiceCategoryResponse> response =
                serviceCategoryService.getAllServiceCategories();

        Logger.printLog(
                LogLevel.INFO,
                LogStep.SERVICE_CATEGORY,
                "Service categories fetched successfully",
                "Returned " + response.size() + " category(ies)",
                null,
                null
        );

        return ResponseEntity.ok(
                ApiResponse.<List<ServiceCategoryResponse>>builder()
                        .success(true)
                        .message("Service categories fetched successfully.")
                        .data(response)
                        .timestamp(dateTimeProvider.now())
                        .build()
        );
    }
}
