package com.bikedone.vehicle_management_service.dto.response;

public record RequestTypeResponse(
        Long id,
        String code,
        String displayName,
        String description
) {}