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
import com.bikedone.order_management_service.service.dispatch.DispatchEngineService;
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
    private final DispatchEngineService dispatchEngineService;

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

    @PostMapping("/{requestId}/accept")
    public ResponseEntity<ApiResponse<Boolean>> acceptServiceRequest(
            @PathVariable UUID requestId,
            @RequestParam UUID mechanicId) {

        boolean accepted = dispatchEngineService.acceptServiceRequest(requestId, mechanicId);
        if (accepted) {
            return ResponseEntity.ok(ApiResponse.success(true, "Service request accepted successfully."));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.failure("Failed to accept service request. Already assigned or inactive."));
        }
    }

    @PatchMapping("/{requestId}/status")
    public ResponseEntity<ApiResponse<CreateServiceRequestResponse>> updateServiceRequestStatus(
            @PathVariable UUID requestId,
            @RequestParam com.bikedone.order_management_service.enums.ServiceRequestStatus status) {

        CreateServiceRequestResponse response = serviceRequestService.updateServiceRequestStatus(requestId, status);
        return ResponseEntity.ok(ApiResponse.success(response, "Service request status updated successfully."));
    }

    @GetMapping("/mechanics/{mechanicId}/pending-notifications")
    public ResponseEntity<ApiResponse<com.bikedone.order_management_service.dto.response.PendingJobNotificationResponse>>
    getPendingNotificationForMechanic(@PathVariable UUID mechanicId) {

        com.bikedone.order_management_service.dto.response.PendingJobNotificationResponse response =
                dispatchEngineService.getPendingNotificationForMechanic(mechanicId);

        return ResponseEntity.ok(ApiResponse.success(response, "Pending job notification fetched successfully."));
    }

    @GetMapping("/mechanics/{mechanicId}/active")
    public ResponseEntity<ApiResponse<MyServiceRequestResponse>> getActiveServiceRequestForMechanic(
            @PathVariable UUID mechanicId) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        serviceRequestService.getActiveServiceRequestForMechanic(mechanicId),
                        "Active service request fetched successfully."
                )
        );
    }
}