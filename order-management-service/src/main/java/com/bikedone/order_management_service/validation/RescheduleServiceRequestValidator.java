package com.bikedone.order_management_service.validation;

import com.bikedone.order_management_service.common.datetime.DateTimeProvider;
import com.bikedone.order_management_service.dto.request.RescheduleServiceRequestRequest;
import com.bikedone.order_management_service.entity.ServiceRequest;
import com.bikedone.order_management_service.entity.ServiceSlot;
import com.bikedone.order_management_service.enums.ServiceRequestStatus;
import com.bikedone.order_management_service.exception.BadRequestException;
import com.bikedone.order_management_service.repository.ServiceSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class RescheduleServiceRequestValidator {

    private final DateTimeProvider dateTimeProvider;
    private final ServiceSlotRepository serviceSlotRepository;

    /**
     * Business rules for reschedule:
     *
     * 1. Immediate requests cannot be rescheduled (they have no scheduled time).
     * 2. Only REQUEST_CREATED and MECHANIC_ASSIGNED statuses allow reschedule.
     *    Once the mechanic is ON_THE_WAY or further, it is too late.
     * 3. The new requested date+time must be at least 30 minutes in the future.
     * 4. The new time must map to a valid active service slot.
     */
    public ServiceSlot validate(ServiceRequest serviceRequest,
                                RescheduleServiceRequestRequest request) {

        // Rule 1 — cannot reschedule an immediate request
        if (Boolean.TRUE.equals(serviceRequest.getIsImmediate())) {
            throw new BadRequestException(
                    "Immediate requests cannot be rescheduled."
            );
        }

        // Rule 2 — status must be REQUEST_CREATED or MECHANIC_ASSIGNED
        ServiceRequestStatus status = serviceRequest.getStatus();
        if (status != ServiceRequestStatus.REQUEST_CREATED
                && status != ServiceRequestStatus.MECHANIC_ASSIGNED) {
            throw new BadRequestException(
                    "Reschedule is not allowed in the current status: " + status
            );
        }

        // Rule 3 — new time must be at least 30 minutes from now
        LocalDateTime requestedDateTime = LocalDateTime.of(
                request.getPreferredServiceDate(),
                request.getPreferredServiceTime()
        );
        LocalDateTime earliest = dateTimeProvider.now().plusMinutes(30);
        if (requestedDateTime.isBefore(earliest)) {
            throw new BadRequestException(
                    "New service time must be at least 30 minutes in the future."
            );
        }

        // Rule 4 — time must match an active service slot
        return serviceSlotRepository
                .findFirstByIsActiveTrueAndSlotTime(request.getPreferredServiceTime())
                .orElseThrow(() ->
                        new BadRequestException(
                                "Selected time does not match any available service slot."
                        ));
    }
}
