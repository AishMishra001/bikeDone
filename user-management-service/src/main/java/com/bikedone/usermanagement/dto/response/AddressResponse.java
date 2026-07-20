package com.bikedone.usermanagement.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
public class AddressResponse {

    private UUID id;

    private String label;

    private String houseNumber;

    private String buildingName;

    private String street;

    private String landmark;

    private String city;

    private String state;

    private String country;

    private String pincode;

    private BigDecimal latitude;

    private BigDecimal longitude;

    private Boolean defaultAddress;
}