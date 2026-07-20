package com.bikedone.usermanagement.service.impl;

import com.bikedone.usermanagement.dto.request.CreateAddressRequest;
import com.bikedone.usermanagement.dto.request.UpdateAddressRequest;
import com.bikedone.usermanagement.dto.response.AddressResponse;
import com.bikedone.usermanagement.entity.User;
import com.bikedone.usermanagement.entity.UserAddress;
import com.bikedone.usermanagement.exception.ResourceNotFoundException;
import com.bikedone.usermanagement.mapper.AddressMapper;
import com.bikedone.usermanagement.repository.UserAddressRepository;
import com.bikedone.usermanagement.repository.UserRepository;
import com.bikedone.usermanagement.security.authentication.AuthenticationFacade;
import com.bikedone.usermanagement.security.user.UserPrincipal;
import com.bikedone.usermanagement.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AddressServiceImpl implements AddressService {

    private final UserAddressRepository userAddressRepository;
    private final UserRepository userRepository;
    private final AddressMapper addressMapper;
    private final AuthenticationFacade authenticationFacade;

    @Override
    @Transactional
    public AddressResponse createAddress(CreateAddressRequest request) {

        UserPrincipal currentUser = authenticationFacade.getCurrentUser();

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserAddress address = addressMapper.toEntity(request);

        address.setUser(user);

        long addressCount = userAddressRepository.countByUserAndDeletedFalse(user);

        if (addressCount == 0) {
            address.setDefaultAddress(true);
        }

        UserAddress savedAddress = userAddressRepository.save(address);

        return addressMapper.toResponse(savedAddress);
    }

    @Override
    public List<AddressResponse> getMyAddresses() {
        return List.of();
    }

    @Override
    public AddressResponse getAddressById(UUID addressId) {
        return null;
    }

    @Override
    public AddressResponse updateAddress(UUID addressId, UpdateAddressRequest request) {
        return null;
    }

    @Override
    public void deleteAddress(UUID addressId) {

    }

    @Override
    public void setDefaultAddress(UUID addressId) {

    }
}