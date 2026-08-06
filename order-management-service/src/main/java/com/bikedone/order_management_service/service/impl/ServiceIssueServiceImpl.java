package com.bikedone.order_management_service.service.impl;

import com.bikedone.order_management_service.common.logging.LogLevel;
import com.bikedone.order_management_service.common.logging.LogStep;
import com.bikedone.order_management_service.common.logging.Logger;
import com.bikedone.order_management_service.dto.response.ServiceIssueResponse;
import com.bikedone.order_management_service.entity.ServiceCategory;
import com.bikedone.order_management_service.exception.ResourceNotFoundException;
import com.bikedone.order_management_service.mapper.ServiceIssueMapper;
import com.bikedone.order_management_service.repository.ServiceCategoryRepository;
import com.bikedone.order_management_service.repository.ServiceIssueRepository;
import com.bikedone.order_management_service.service.ServiceIssueService;
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

        Logger.printLog(
                LogLevel.INFO,
                LogStep.SERVICE_ISSUE,
                "Fetching service issues",
                "categoryId=" + categoryId,
                null,
                categoryId.toString()
        );

        ServiceCategory serviceCategory = serviceCategoryRepository
                .findById(categoryId)
                .orElseThrow(() -> {
                    Logger.printLog(
                            LogLevel.WARN,
                            LogStep.SERVICE_ISSUE,
                            "Service category not found",
                            "categoryId=" + categoryId,
                            null,
                            categoryId.toString()
                    );
                    return new ResourceNotFoundException("Service category not found.");
                });

        List<ServiceIssueResponse> result = serviceIssueRepository
                .findByServiceCategoryIdAndActiveTrueOrderByDisplayNameAsc(serviceCategory.getId())
                .stream()
                .map(ServiceIssueMapper::toResponse)
                .toList();

        Logger.printLog(
                LogLevel.INFO,
                LogStep.SERVICE_ISSUE,
                "Service issues fetched successfully",
                "Returned " + result.size() + " issue(s) for categoryId=" + categoryId,
                null,
                categoryId.toString()
        );

        return result;
    }
}
