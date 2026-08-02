package com.bikedone.vehicle_management_service.service.impl;

import com.bikedone.vehicle_management_service.dto.response.ServiceCategoryResponse;
import com.bikedone.vehicle_management_service.mapper.ServiceCategoryMapper;
import com.bikedone.vehicle_management_service.repository.ServiceCategoryRepository;
import com.bikedone.vehicle_management_service.service.ServiceCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceCategoryServiceImpl implements ServiceCategoryService {

    private final ServiceCategoryRepository serviceCategoryRepository;

    @Override
    public List<ServiceCategoryResponse> getAllServiceCategories() {

        return serviceCategoryRepository.findByActiveTrueOrderByDisplayNameAsc()
                .stream()
                .map(ServiceCategoryMapper::toResponse)
                .toList();
    }
}