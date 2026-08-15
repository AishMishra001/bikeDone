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

        /** e.g. "Honda Shine" */
        String vehicleName,

        /** e.g. "DL 5S AB 1234" */
        String vehicleRegistrationNumber,

        /**
         * Formatted service address.
         * For saved address: concatenated fields from user_addresses.
         * For live location: the note/reverse-geocoded string.
         */
        String serviceAddress,

        java.math.BigDecimal latitude,

        java.math.BigDecimal longitude,

        java.math.BigDecimal totalPayableAmount,
        
        java.math.BigDecimal extraAmount,

        java.math.BigDecimal baseCharge,
        
        UUID assignedMechanicId,
        
        String servicePin,

        /** Issue description entered by the customer (nullable). */
        String description,

        /** Cloudinary image URLs uploaded by the customer. Empty list if none. */
        List<String> imageUrls

) {
}
