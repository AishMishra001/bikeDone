package com.bikedone.vehicle_management_service.controller;

import com.bikedone.vehicle_management_service.common.logging.LogLevel;
import com.bikedone.vehicle_management_service.common.logging.LogStep;
import com.bikedone.vehicle_management_service.common.logging.Logger;
import com.bikedone.vehicle_management_service.common.response.ApiResponse;
import com.bikedone.vehicle_management_service.dto.response.RequestTypeResponse;
import com.bikedone.vehicle_management_service.service.RequestTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/request-types")
@RequiredArgsConstructor
public class RequestTypeController {

    private final RequestTypeService requestTypeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RequestTypeResponse>>> getAllRequestTypes() {

        Logger.printLog(
                LogLevel.INFO,
                LogStep.REQUEST_TYPE,
                "Fetch all request types received",
                "Fetching all active request types",
                null,
                null
        );

        List<RequestTypeResponse> response = requestTypeService.getAllRequestTypes();

        Logger.printLog(
                LogLevel.INFO,
                LogStep.REQUEST_TYPE,
                "Request types fetched successfully",
                "Returned " + response.size() + " request type(s)",
                null,
                null
        );

        return ResponseEntity.ok(
                ApiResponse.success(response, "Request types fetched successfully.")
        );
    }
}
