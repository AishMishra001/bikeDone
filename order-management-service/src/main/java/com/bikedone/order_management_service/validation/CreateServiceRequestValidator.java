package com.bikedone.order_management_service.validation;

import com.bikedone.order_management_service.common.datetime.DateTimeProvider;
import com.bikedone.order_management_service.dto.request.CreateServiceRequestRequest;
import com.bikedone.order_management_service.entity.RequestType;
import com.bikedone.order_management_service.entity.ServiceCategory;
import com.bikedone.order_management_service.entity.ServiceSlot;
import com.bikedone.order_management_service.exception.BadRequestException;
import com.bikedone.order_management_service.exception.ResourceNotFoundException;
import com.bikedone.order_management_service.repository.RequestTypeRepository;
import com.bikedone.order_management_service.repository.ServiceCategoryRepository;
import com.bikedone.order_management_service.repository.ServiceIssueRepository;
import com.bikedone.order_management_service.repository.ServiceSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Component
@RequiredArgsConstructor
public class CreateServiceRequestValidator {

    private final RequestTypeRepository requestTypeRepository;
    private final ServiceCategoryRepository serviceCategoryRepository;
    private final ServiceSlotRepository serviceSlotRepository;
    private final ServiceIssueRepository serviceIssueRepository;
    private final DateTimeProvider dateTimeProvider;

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
     * Validate Service Slot — exact slot_time match.
     * The client must pick a time that corresponds to one of the 48 seeded slots.
     */
    public ServiceSlot validateServiceSlotForTime(LocalTime preferredServiceTime) {

        return serviceSlotRepository
                .findFirstByIsActiveTrueAndSlotTime(preferredServiceTime)
                .orElseThrow(() ->
                        new BadRequestException("Selected service time does not match any available slot."));
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

        if (!Boolean.TRUE.equals(request.getIsImmediate())) {
            if (request.getPreferredServiceDate() == null) {
                throw new BadRequestException("Preferred service date is required.");
            }

            if (request.getPreferredServiceTime() == null) {
                throw new BadRequestException("Preferred service time is required.");
            }

            LocalDateTime requestedDateTime = LocalDateTime.of(
                    request.getPreferredServiceDate(),
                    request.getPreferredServiceTime()
            );
            LocalDateTime earliestAllowedTime = dateTimeProvider.now().plusMinutes(30);

            if (requestedDateTime.isBefore(earliestAllowedTime)) {
                throw new BadRequestException("Scheduled service time must be at least 30 minutes in the future.");
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
