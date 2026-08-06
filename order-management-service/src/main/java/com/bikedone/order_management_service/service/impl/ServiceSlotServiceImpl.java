package com.bikedone.order_management_service.service.impl;

import com.bikedone.order_management_service.dto.response.ServiceSlotResponse;
import com.bikedone.order_management_service.entity.ServiceSlot;
import com.bikedone.order_management_service.exception.ResourceNotFoundException;
import com.bikedone.order_management_service.mapper.ServiceSlotMapper;
import com.bikedone.order_management_service.repository.ServiceSlotRepository;
import com.bikedone.order_management_service.service.ServiceSlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ServiceSlotServiceImpl implements ServiceSlotService {

    private final ServiceSlotRepository serviceSlotRepository;

    @Override
    public List<ServiceSlotResponse> getAllServiceSlots() {
        return serviceSlotRepository
                .findByIsActiveTrueOrderByStartTimeAsc()
                .stream()
                .map(ServiceSlotMapper::toResponse)
                .toList();
    }

    @Override
    public ServiceSlotResponse getServiceSlotById(UUID serviceSlotId) {
        ServiceSlot slot = serviceSlotRepository
                .findByIdAndIsActiveTrue(serviceSlotId)
                .orElseThrow(() -> new ResourceNotFoundException("Service slot not found."));

        return ServiceSlotMapper.toResponse(slot);
    }
}
