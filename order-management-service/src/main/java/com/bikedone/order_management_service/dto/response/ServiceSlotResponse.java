package com.bikedone.order_management_service.dto.response;

import lombok.Builder;

import java.util.UUID;

/**
 * Response DTO for a service slot.
 * slotTime is returned as "HH:mm" (24-hour) so the frontend
 * can display it however it likes (e.g. "9:00 AM").
 */
@Builder
public record ServiceSlotResponse(
        UUID id,
        String slotName,
        String slotTime
) {
}
