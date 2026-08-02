package com.bikedone.vehicle_management_service.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class CreateServiceRequestRequest {

    @NotNull(message = "Customer vehicle is required.")
    private UUID customerVehicleId;

    @NotNull(message = "Address is required.")
    private UUID addressId;

    @NotNull(message = "Request type is required.")
    private Long requestTypeId;

    @NotNull(message = "Preferred service date is required.")
    @FutureOrPresent(message = "Preferred service date cannot be in the past.")
    private LocalDate preferredServiceDate;

    @NotNull(message = "Service slot is required.")
    private UUID serviceSlotId;

    @NotNull(message = "Issue identified flag is required.")
    private Boolean isIssueIdentified;

    private Long serviceCategoryId;

    private List<Long> serviceIssueIds;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters.")
    private String description;
}