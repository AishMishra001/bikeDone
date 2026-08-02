package com.bikedone.vehicle_management_service.service.impl;

import com.bikedone.vehicle_management_service.dto.response.ServiceIssueResponse;
import com.bikedone.vehicle_management_service.entity.ServiceCategory;
import com.bikedone.vehicle_management_service.exception.ResourceNotFoundException;
import com.bikedone.vehicle_management_service.mapper.ServiceIssueMapper;
import com.bikedone.vehicle_management_service.repository.ServiceCategoryRepository;
import com.bikedone.vehicle_management_service.repository.ServiceIssueRepository;
import com.bikedone.vehicle_management_service.service.ServiceIssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceIssueServiceImpl implements ServiceIssueService {

    private final ServiceIssueRepository serviceIssueRepository;
    private final ServiceCategoryRepository serviceCategoryRepository;

    @Override
    public List<ServiceIssueResponse> getServiceIssues(Long categoryId) {

        ServiceCategory serviceCategory = serviceCategoryRepository
                .findById(categoryId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Service category not found."));

        return serviceIssueRepository
                .findByServiceCategoryIdAndActiveTrueOrderByDisplayNameAsc(serviceCategory.getId())
                .stream()
                .map(ServiceIssueMapper::toResponse)
                .toList();
    }
}