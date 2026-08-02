package com.bikedone.vehicle_management_service.service;

import com.bikedone.vehicle_management_service.dto.response.ServiceIssueResponse;

import java.util.List;

public interface ServiceIssueService {

    List<ServiceIssueResponse> getServiceIssues(Long categoryId);

}