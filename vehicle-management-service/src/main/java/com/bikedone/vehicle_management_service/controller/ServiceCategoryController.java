package com.bikedone.vehicle_management_service.controller;

import com.bikedone.vehicle_management_service.common.datetime.DateTimeProvider;
import com.bikedone.vehicle_management_service.common.response.ApiResponse;
import com.bikedone.vehicle_management_service.dto.response.ServiceCategoryResponse;
import com.bikedone.vehicle_management_service.service.ServiceCategoryService;
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

        List<ServiceCategoryResponse> response =
                serviceCategoryService.getAllServiceCategories();

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