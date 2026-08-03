package com.bikedone.vehicle_management_service.validation;

import com.bikedone.vehicle_management_service.entity.ServiceRequest;
import com.bikedone.vehicle_management_service.enums.ServiceRequestStatus;
import com.bikedone.vehicle_management_service.exception.BadRequestException;
import org.springframework.stereotype.Component;

@Component
public class CancelServiceRequestValidator {

    public void validate(ServiceRequest serviceRequest) {

        ServiceRequestStatus status = serviceRequest.getStatus();

        switch (status) {

            case REQUEST_CREATED:
            case MECHANIC_ASSIGNED:
                return;

            case CANCELLED:
                throw new BadRequestException(
                        "Service request is already cancelled."
                );

            case ON_THE_WAY:
            case ARRIVED:
            case INSPECTION_STARTED:
            case ESTIMATE_PREPARED:
            case CUSTOMER_APPROVED:
            case WORK_STARTED:
            case WORK_COMPLETED:
                throw new BadRequestException(
                        "Service request cannot be cancelled in current status."
                );

            default:
                throw new BadRequestException(
                        "Invalid service request status."
                );
        }
    }
}