package com.bikedone.vehicle_management_service.dto.response;

import lombok.Builder;

import java.util.UUID;

@Builder
public record ServiceSlotResponse(
        UUID id,
        String slotName,
        String startTime,
        String endTime,
        Integer maxCapacity
) {
}
