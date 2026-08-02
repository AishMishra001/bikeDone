package com.bikedone.vehicle_management_service.validation;

import com.bikedone.vehicle_management_service.dto.request.CreateServiceRequestRequest;
import com.bikedone.vehicle_management_service.entity.RequestType;
import com.bikedone.vehicle_management_service.entity.ServiceCategory;
import com.bikedone.vehicle_management_service.entity.ServiceSlot;
import com.bikedone.vehicle_management_service.exception.BadRequestException;
import com.bikedone.vehicle_management_service.exception.ResourceNotFoundException;
import com.bikedone.vehicle_management_service.repository.RequestTypeRepository;
import com.bikedone.vehicle_management_service.repository.ServiceCategoryRepository;
import com.bikedone.vehicle_management_service.repository.ServiceIssueRepository;
import com.bikedone.vehicle_management_service.repository.ServiceSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CreateServiceRequestValidator {

    private final RequestTypeRepository requestTypeRepository;
    private final ServiceCategoryRepository serviceCategoryRepository;
    private final ServiceSlotRepository serviceSlotRepository;
    private final ServiceIssueRepository serviceIssueRepository;

    /**
     * Validate Request Type
     */
    public RequestType validateRequestType(Long requestTypeId) {

        return requestTypeRepository
                .findByIdAndActiveTrue(requestTypeId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Request type not found."));
    }

    /**
     * Validate Service Slot
     */
    public ServiceSlot validateServiceSlot(UUID serviceSlotId) {

        return serviceSlotRepository
                .findByIdAndIsActiveTrue(serviceSlotId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Service slot not found."));
    }

    /**
     * Validate Service Category
     */
    public ServiceCategory validateServiceCategory(Long serviceCategoryId) {

        return serviceCategoryRepository
                .findByIdAndActiveTrue(serviceCategoryId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Service category not found."));
    }

    /**
     * Validate Business Rules
     */
    public void validate(CreateServiceRequestRequest request) {

        // Customer doesn't know the issue.
        if (!Boolean.TRUE.equals(request.getIsIssueIdentified())) {
            return;
        }

        if (request.getServiceCategoryId() == null) {
            throw new BadRequestException("Service category is required.");
        }

        if (request.getServiceIssueIds() == null
                || request.getServiceIssueIds().isEmpty()) {

            throw new BadRequestException(
                    "At least one service issue is required."
            );
        }

        long count = serviceIssueRepository
                .countByIdInAndServiceCategoryIdAndActiveTrue(
                        request.getServiceIssueIds(),
                        request.getServiceCategoryId()
                );

        if (count != request.getServiceIssueIds().size()) {

            throw new BadRequestException(
                    "One or more selected service issues are invalid."
            );
        }
    }
}