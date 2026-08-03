package com.bikedone.vehicle_management_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CancelServiceRequestRequest {

    @NotBlank(message = "Cancellation reason is required.")
    @Size(max = 500, message = "Reason cannot exceed 500 characters.")
    private String reason;

}