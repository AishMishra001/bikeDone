package com.bikedone.order_management_service.controller;

import com.bikedone.order_management_service.common.logging.LogLevel;
import com.bikedone.order_management_service.common.logging.LogStep;
import com.bikedone.order_management_service.common.logging.Logger;
import com.bikedone.order_management_service.common.response.ApiResponse;
import com.bikedone.order_management_service.dto.request.CancelServiceRequestRequest;
import com.bikedone.order_management_service.dto.request.CreateServiceRequestRequest;
import com.bikedone.order_management_service.dto.request.RescheduleServiceRequestRequest;
import com.bikedone.order_management_service.dto.response.CreateServiceRequestResponse;
import com.bikedone.order_management_service.dto.response.MyServiceRequestResponse;
import com.bikedone.order_management_service.service.ServiceRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

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

    @GetMapping
    public ResponseEntity<ApiResponse<List<MyServiceRequestResponse>>> getMyServiceRequests() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        serviceRequestService.getMyServiceRequests(),
                        "Service requests fetched successfully."
                )
        );
    }

    @GetMapping("/{requestId}")
    public ResponseEntity<ApiResponse<MyServiceRequestResponse>> getServiceRequestById(
            @PathVariable UUID requestId) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        serviceRequestService.getServiceRequestById(requestId),
                        "Service request fetched successfully."
                )
        );
    }

    @PatchMapping("/{requestId}/cancel")
    public ResponseEntity<ApiResponse<CreateServiceRequestResponse>> cancelServiceRequest(
            @PathVariable UUID requestId,
            @Valid @RequestBody CancelServiceRequestRequest request) {

        Logger.printLog(LogLevel.INFO, LogStep.SERVICE_REQUEST, "Cancel service request initiated", "requestId=" + requestId, null, requestId.toString());

        CreateServiceRequestResponse response =
                serviceRequestService.cancelServiceRequest(requestId, request);

        return ResponseEntity.ok(
                ApiResponse.success(response, "Service request cancelled successfully.")
        );
    }

    @PatchMapping("/{requestId}/reschedule")
    public ResponseEntity<ApiResponse<CreateServiceRequestResponse>> rescheduleServiceRequest(
            @PathVariable UUID requestId,
            @Valid @RequestBody RescheduleServiceRequestRequest request) {

        Logger.printLog(LogLevel.INFO, LogStep.SERVICE_REQUEST, "Reschedule service request initiated", "requestId=" + requestId, null, requestId.toString());

        CreateServiceRequestResponse response =
                serviceRequestService.rescheduleServiceRequest(requestId, request);

        return ResponseEntity.ok(
                ApiResponse.success(response, "Service request rescheduled successfully.")
        );
    }
}