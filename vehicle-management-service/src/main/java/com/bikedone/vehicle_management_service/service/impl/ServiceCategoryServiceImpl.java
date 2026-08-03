package com.bikedone.vehicle_management_service.service.impl;

import com.bikedone.vehicle_management_service.common.logging.LogLevel;
import com.bikedone.vehicle_management_service.common.logging.LogStep;
import com.bikedone.vehicle_management_service.common.logging.Logger;
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

        Logger.printLog(
                LogLevel.INFO,
                LogStep.SERVICE_CATEGORY,
                "Fetching all service categories",
                "Querying active service categories ordered by displayName",
                null,
                null
        );

        List<ServiceCategoryResponse> result = serviceCategoryRepository
                .findByActiveTrueOrderByDisplayNameAsc()
                .stream()
                .map(ServiceCategoryMapper::toResponse)
                .toList();

        Logger.printLog(
                LogLevel.INFO,
                LogStep.SERVICE_CATEGORY,
                "Service categories fetched successfully",
                "Returned " + result.size() + " category(ies)",
                null,
                null
        );

        return result;
    }
}
