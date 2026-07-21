package com.bikedone.usermanagement.controller;

import com.bikedone.usermanagement.common.datetime.DateTimeProvider;
import com.bikedone.usermanagement.common.response.ApiResponse;
import com.bikedone.usermanagement.dto.request.CreateAddressRequest;
import com.bikedone.usermanagement.dto.request.UpdateAddressRequest;
import com.bikedone.usermanagement.dto.response.AddressResponse;
import com.bikedone.usermanagement.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

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

    @GetMapping("/{addressId}")
    public ApiResponse<AddressResponse> getAddressById(
            @PathVariable UUID addressId) {

        AddressResponse response = addressService.getAddressById(addressId);

        return ApiResponse.<AddressResponse>builder()
                .success(true)
                .message("Address fetched successfully.")
                .data(response)
                .timestamp(dateTimeProvider.now())
                .build();
    }

    @PutMapping("/{addressId}")
    public ApiResponse<AddressResponse> updateAddress(
            @PathVariable UUID addressId,
            @Valid @RequestBody UpdateAddressRequest request) {

        AddressResponse response = addressService.updateAddress(addressId, request);

        return ApiResponse.<AddressResponse>builder()
                .success(true)
                .message("Address updated successfully.")
                .data(response)
                .timestamp(dateTimeProvider.now())
                .build();
    }

    @DeleteMapping("/{addressId}")
    public ApiResponse<Void> deleteAddress(
            @PathVariable UUID addressId) {

        addressService.deleteAddress(addressId);

        return ApiResponse.<Void>builder()
                .success(true)
                .message("Address deleted successfully.")
                .timestamp(dateTimeProvider.now())
                .build();
    }
}
