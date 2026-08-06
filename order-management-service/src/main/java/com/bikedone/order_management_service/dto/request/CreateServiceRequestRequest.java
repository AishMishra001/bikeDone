package com.bikedone.order_management_service.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class CreateServiceRequestRequest {

    @NotNull(message = "Customer vehicle is required.")
    private UUID customerVehicleId;

    private UUID addressId;

    @NotNull(message = "Request type is required.")
    private Long requestTypeId;

    private LocalDate preferredServiceDate;

    private LocalTime preferredServiceTime;

    /**
     * When true, the request is dispatched as soon as possible. The server sets
     * the requested date and time to its current time and does not assign a slot.
     */
    @NotNull(message = "Immediate request flag is required.")
    private Boolean isImmediate = false;

    @Valid
    private CurrentLocationRequest currentLocation;

    @NotNull(message = "Issue identified flag is required.")
    private Boolean isIssueIdentified;

    private Long serviceCategoryId;

    private List<Long> serviceIssueIds;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters.")
    private String description;

    /**
     * Optional list of Cloudinary image URLs uploaded before submitting.
     * Max 5 URLs, each max 2000 chars.
     */
    @Size(max = 5, message = "Maximum 5 images are allowed.")
    private List<String> imageUrls;
}
