package com.bikedone.order_management_service.mapper;

import com.bikedone.order_management_service.dto.response.ServiceSlotResponse;
import com.bikedone.order_management_service.entity.ServiceSlot;

public class ServiceSlotMapper {

    private ServiceSlotMapper() {
    }

    public static ServiceSlotResponse toResponse(ServiceSlot entity) {
        return ServiceSlotResponse.builder()
                .id(entity.getId())
                .slotName(entity.getSlotName())
                .startTime(entity.getStartTime().toString())
                .endTime(entity.getEndTime().toString())
                .maxCapacity(entity.getMaxCapacity())
                .build();
    }
}
