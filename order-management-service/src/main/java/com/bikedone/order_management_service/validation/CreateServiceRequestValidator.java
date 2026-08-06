package com.bikedone.order_management_service.validation;

import com.bikedone.order_management_service.dto.request.CreateServiceRequestRequest;
import com.bikedone.order_management_service.entity.RequestType;
import com.bikedone.order_management_service.entity.ServiceCategory;
import com.bikedone.order_management_service.entity.ServiceSlot;
import com.bikedone.order_management_service.enums.RequestTypeCode;
import com.bikedone.order_management_service.exception.BadRequestException;
import com.bikedone.order_management_service.exception.ResourceNotFoundException;
import com.bikedone.order_management_service.repository.RequestTypeRepository;
import com.bikedone.order_management_service.repository.ServiceCategoryRepository;
import com.bikedone.order_management_service.repository.ServiceIssueRepository;
import com.bikedone.order_management_service.repository.ServiceSlotRepository;
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
    public void validate(CreateServiceRequestRequest request, RequestType requestType) {

        validateLocation(request);

        boolean isBreakdown = RequestTypeCode.BREAKDOWN.equals(
                requestType.getRequestTypeCode()
        );

        if (isBreakdown) {
            if (request.getPreferredServiceDate() != null
                    || request.getServiceSlotId() != null) {
                throw new BadRequestException(
                        "Preferred service date and service slot must not be provided for breakdown assistance."
                );
            }
        } else {
            if (request.getPreferredServiceDate() == null) {
                throw new BadRequestException("Preferred service date is required.");
            }

            if (request.getPreferredServiceDate().isBefore(java.time.LocalDate.now())) {
                throw new BadRequestException("Preferred service date cannot be in the past.");
            }

            if (request.getServiceSlotId() == null) {
                throw new BadRequestException("Service slot is required.");
            }
        }

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

    private void validateLocation(CreateServiceRequestRequest request) {
        boolean hasSavedAddress = request.getAddressId() != null;
        boolean hasCurrentLocation = request.getCurrentLocation() != null;

        if (!hasSavedAddress && !hasCurrentLocation) {
            throw new BadRequestException("Either address or current location is required.");
        }

        if (hasSavedAddress && hasCurrentLocation) {
            throw new BadRequestException("Provide either address or current location, not both.");
        }
    }
}
