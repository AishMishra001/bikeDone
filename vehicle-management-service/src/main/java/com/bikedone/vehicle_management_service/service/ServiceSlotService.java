package com.bikedone.vehicle_management_service.service;

import com.bikedone.vehicle_management_service.dto.response.ServiceSlotResponse;

import java.util.List;
import java.util.UUID;

public interface ServiceSlotService {

    List<ServiceSlotResponse> getAllServiceSlots();

    ServiceSlotResponse getServiceSlotById(UUID serviceSlotId);
}
