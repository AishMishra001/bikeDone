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

        UserPrincipal currentUser = authenticationFacade.getCurrentUser();

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        return userAddressRepository.findByUserAndDeletedFalseOrderByDefaultAddressDescCreatedAtDesc(user)
                .stream()
                .map(addressMapper::toResponse)
                .toList();
    }

    @Override
    public AddressResponse getAddressById(UUID addressId) {

        UserPrincipal currentUser = authenticationFacade.getCurrentUser();

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        UserAddress address = userAddressRepository
                .findByIdAndUserAndDeletedFalse(addressId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found."));

        return addressMapper.toResponse(address);
    }

    @Override
    public AddressResponse updateAddress(UUID addressId, UpdateAddressRequest request) {

        UserPrincipal currentUser = authenticationFacade.getCurrentUser();

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        UserAddress address = userAddressRepository
                .findByIdAndUserAndDeletedFalse(addressId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found."));

        addressMapper.updateEntity(request, address);

        UserAddress updatedAddress = userAddressRepository.save(address);

        return addressMapper.toResponse(updatedAddress);
    }

    @Override
    public void deleteAddress(UUID addressId) {

        UserPrincipal currentUser = authenticationFacade.getCurrentUser();

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        UserAddress address = userAddressRepository
                .findByIdAndUserAndDeletedFalse(addressId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found."));

        boolean wasDefault = Boolean.TRUE.equals(address.getDefaultAddress());

        address.setDeleted(true);
        address.setDefaultAddress(false);

        userAddressRepository.save(address);

        if (wasDefault) {

            List<UserAddress> remainingAddresses =
                    userAddressRepository.findByUserAndDeletedFalseAndIdNot(user, addressId);

            if (!remainingAddresses.isEmpty()) {

                UserAddress newDefault = remainingAddresses.get(0);

                newDefault.setDefaultAddress(true);

                userAddressRepository.save(newDefault);
            }
        }
    }

    @Override
    @Transactional
    public void setDefaultAddress(UUID addressId) {

        UserPrincipal currentUser = authenticationFacade.getCurrentUser();

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        UserAddress newDefaultAddress = userAddressRepository
                .findByIdAndUserAndDeletedFalse(addressId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found."));

        // If already default, nothing to do
        if (Boolean.TRUE.equals(newDefaultAddress.getDefaultAddress())) {
            return;
        }

        userAddressRepository
                .findByUserAndDefaultAddressTrueAndDeletedFalse(user)
                .ifPresent(address -> {
                    address.setDefaultAddress(false);
                    userAddressRepository.save(address);
                });

        newDefaultAddress.setDefaultAddress(true);

        userAddressRepository.save(newDefaultAddress);
    }

}