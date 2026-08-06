package com.bikedone.order_management_service.dto.response;

import com.bikedone.order_management_service.enums.ServiceRequestStatus;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Builder
public record MyServiceRequestResponse(

        UUID id,

        String requestNumber,

        String requestType,

        ServiceRequestStatus status,

        LocalDate preferredServiceDate,

        LocalTime preferredServiceTime,

        Boolean isImmediate,

        String serviceSlot,

        UUID customerVehicleId,

        /** Cloudinary image URLs uploaded by the customer. Empty list if none. */
        List<String> imageUrls

) {
}
