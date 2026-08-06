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
                // "HH:mm" 24-hour format, e.g. "09:00", "13:30"
                .slotTime(entity.getSlotTime().toString())
                .build();
    }
}
