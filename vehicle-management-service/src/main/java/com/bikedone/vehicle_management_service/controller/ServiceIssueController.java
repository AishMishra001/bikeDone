package com.bikedone.vehicle_management_service.controller;

import com.bikedone.vehicle_management_service.common.logging.LogLevel;
import com.bikedone.vehicle_management_service.common.logging.LogStep;
import com.bikedone.vehicle_management_service.common.logging.Logger;
import com.bikedone.vehicle_management_service.common.response.ApiResponse;
import com.bikedone.vehicle_management_service.dto.response.ServiceIssueResponse;
import com.bikedone.vehicle_management_service.service.ServiceIssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/service-issues")
@RequiredArgsConstructor
public class ServiceIssueController {

    private final ServiceIssueService serviceIssueService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ServiceIssueResponse>>> getServiceIssues(
            @RequestParam Long categoryId) {

        Logger.printLog(
                LogLevel.INFO,
                LogStep.SERVICE_ISSUE,
                "Fetch service issues request received",
                "Fetching issues for categoryId=" + categoryId,
                null,
                categoryId.toString()
        );

        List<ServiceIssueResponse> response =
                serviceIssueService.getServiceIssues(categoryId);

        Logger.printLog(
                LogLevel.INFO,
                LogStep.SERVICE_ISSUE,
                "Service issues fetched successfully",
                "Returned " + response.size() + " issue(s)",
                null,
                categoryId.toString()
        );

        return ResponseEntity.ok(
                ApiResponse.success(response, "Service issues fetched successfully.")
        );
    }
}
