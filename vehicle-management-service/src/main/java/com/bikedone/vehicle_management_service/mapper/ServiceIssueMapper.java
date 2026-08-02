package com.bikedone.vehicle_management_service.mapper;

import com.bikedone.vehicle_management_service.dto.response.ServiceIssueResponse;
import com.bikedone.vehicle_management_service.entity.ServiceIssue;

public class ServiceIssueMapper {

    private ServiceIssueMapper() {
    }

    public static ServiceIssueResponse toResponse(ServiceIssue entity) {

        return ServiceIssueResponse.builder()
                .id(entity.getId())
                .code(entity.getIssueCode())
                .displayName(entity.getDisplayName())
                .build();
    }
}