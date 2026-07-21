package com.bikedone.usermanagement.controller;

import com.bikedone.usermanagement.common.datetime.DateTimeProvider;
import com.bikedone.usermanagement.common.response.ApiResponse;
import com.bikedone.usermanagement.dto.request.CreateAddressRequest;
import com.bikedone.usermanagement.dto.response.AddressResponse;
import com.bikedone.usermanagement.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;
    private final DateTimeProvider dateTimeProvider;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AddressResponse> createAddress(
            @Valid @RequestBody CreateAddressRequest request) {

        AddressResponse response = addressService.createAddress(request);

        return ApiResponse.<AddressResponse>builder()
                .success(true)
                .message("Address created successfully.")
                .data(response)
                .timestamp(dateTimeProvider.now())
                .build();
    }

    @GetMapping
    public ApiResponse<List<AddressResponse>> getMyAddresses() {

        List<AddressResponse> response = addressService.getMyAddresses();

        return ApiResponse.<List<AddressResponse>>builder()
                .success(true)
                .message("Addresses fetched successfully.")
                .data(response)
                .timestamp(dateTimeProvider.now())
                .build();
    }
}