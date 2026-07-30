package com.bikedone.vehicle_management_service.service.impl;

import com.bikedone.vehicle_management_service.dto.response.RequestTypeResponse;
import com.bikedone.vehicle_management_service.mapper.RequestTypeMapper;
import com.bikedone.vehicle_management_service.repository.RequestTypeRepository;
import com.bikedone.vehicle_management_service.service.RequestTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RequestTypeServiceImpl implements RequestTypeService {

    private final RequestTypeRepository requestTypeRepository;

    @Override
    public List<RequestTypeResponse> getAllRequestTypes() {

        return requestTypeRepository.findByActiveTrueOrderByDisplayNameAsc()
                .stream()
                .map(RequestTypeMapper::toResponse)
                .toList();

    }
}