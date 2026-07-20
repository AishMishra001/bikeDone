package com.bikedone.usermanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CreateAddressRequest {

    @NotBlank(message = "Label is required")
    @Size(max = 50)
    private String label;

    @NotBlank(message = "House number is required")
    private String houseNumber;

    private String buildingName;

    @NotBlank(message = "Street is required")
    private String street;

    private String landmark;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "Country is required")
    private String country;

    @NotBlank(message = "Pincode is required")
    @Size(min = 6, max = 10)
    private String pincode;

    private BigDecimal latitude;

    private BigDecimal longitude;
}