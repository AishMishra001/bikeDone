package com.bikedone.vehicle_management_service.controller;

import com.bikedone.vehicle_management_service.common.response.ApiResponse;
import com.bikedone.vehicle_management_service.dto.request.CreateServiceRequestRequest;
import com.bikedone.vehicle_management_service.dto.response.CreateServiceRequestResponse;
import com.bikedone.vehicle_management_service.service.ServiceRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/service-requests")
@RequiredArgsConstructor
public class ServiceRequestController {

    private final ServiceRequestService serviceRequestService;

    @PostMapping
    public ResponseEntity<ApiResponse<CreateServiceRequestResponse>>
    createServiceRequest(
            @Valid @RequestBody CreateServiceRequestRequest request) {

        CreateServiceRequestResponse response =
                serviceRequestService.createServiceRequest(request);

        return ResponseEntity.ok(
                ApiResponse.success(
                        response,
                        "Service request created successfully."
                )
        );
    }
}