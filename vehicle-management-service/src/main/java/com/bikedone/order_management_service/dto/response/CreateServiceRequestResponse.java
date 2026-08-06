package com.bikedone.order_management_service.dto.response;

import com.bikedone.order_management_service.enums.ServiceRequestStatus;

import java.util.UUID;

public record CreateServiceRequestResponse(

        UUID id,

        String requestNumber,

        ServiceRequestStatus status

) {
}