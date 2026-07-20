package com.bikedone.usermanagement.service;

import com.bikedone.usermanagement.dto.request.CreateAddressRequest;
import com.bikedone.usermanagement.dto.request.UpdateAddressRequest;
import com.bikedone.usermanagement.dto.response.AddressResponse;

import java.util.List;
import java.util.UUID;

public interface AddressService {

    AddressResponse createAddress(CreateAddressRequest request);

    List<AddressResponse> getMyAddresses();

    AddressResponse getAddressById(UUID addressId);

    AddressResponse updateAddress(UUID addressId, UpdateAddressRequest request);

    void deleteAddress(UUID addressId);

    void setDefaultAddress(UUID addressId);
}