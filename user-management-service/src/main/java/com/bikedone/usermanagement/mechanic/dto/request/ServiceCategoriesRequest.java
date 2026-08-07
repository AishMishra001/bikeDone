package com.bikedone.usermanagement.mechanic.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class ServiceCategoriesRequest {

    private Boolean selectAll = false;

    @NotEmpty(message = "At least one service must be selected unless selectAll is true.")
    private List<String> services;
}
