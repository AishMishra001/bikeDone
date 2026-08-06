package com.bikedone.order_management_service.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class RescheduleServiceRequestRequest {

    @NotNull(message = "New preferred date is required.")
    private LocalDate preferredServiceDate;

    @NotNull(message = "New preferred time is required.")
    private LocalTime preferredServiceTime;
}
