package com.bikedone.usermanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class UpdateAddressRequest {

    @NotBlank
    @Size(max = 50)
    private String label;

    @NotBlank
    private String houseNumber;

    private String buildingName;

    @NotBlank
    private String street;

    private String landmark;

    @NotBlank
    private String city;

    @NotBlank
    private String state;

    @NotBlank
    private String country;

    @NotBlank
    @Size(min = 6, max = 10)
    private String pincode;

    private BigDecimal latitude;

    private BigDecimal longitude;
}