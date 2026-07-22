package com.bikedone.usermanagement.service.impl;

import com.bikedone.usermanagement.common.logging.LogLevel;
import com.bikedone.usermanagement.common.logging.LogStep;
import com.bikedone.usermanagement.common.logging.Logger;
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

                User user = getAuthenticatedUser();

                Logger.printLog(LogLevel.INFO, LogStep.ADDRESS, "Create address request received",
                                "Creating address for authenticated user", user.getId().toString(), null);

                UserAddress address = addressMapper.toEntity(request);

                address.setUser(user);

                long addressCount = userAddressRepository.countByUserAndDeletedFalse(user);

                if (addressCount == 0) {
                        Logger.printLog(LogLevel.INFO, LogStep.ADDRESS, "Default address assigned",
                                        "First address marked as default", user.getId().toString(), null);
                        address.setDefaultAddress(true);
                }

                UserAddress savedAddress = userAddressRepository.save(address);

                Logger.printLog(LogLevel.INFO, LogStep.ADDRESS, "Address created successfully",
                                "Address saved successfully", user.getId().toString(), savedAddress.getId().toString());

                return addressMapper.toResponse(savedAddress);
        }

        @Override
        public List<AddressResponse> getMyAddresses() {

                User user = getAuthenticatedUser();

                Logger.printLog(LogLevel.INFO, LogStep.ADDRESS, "Fetch addresses request received",
                                "Fetching all addresses for authenticated user", user.getId().toString(), null);

                Logger.printLog(LogLevel.INFO, LogStep.ADDRESS, "Addresses fetched successfully",
                                "Total addresses: " + userAddressRepository.countByUserAndDeletedFalse(user),
                                user.getId().toString(), null);

                return userAddressRepository.findByUserAndDeletedFalseOrderByDefaultAddressDescCreatedAtDesc(user)
                                .stream()
                                .map(addressMapper::toResponse)
                                .toList();
        }

        @Override
        public AddressResponse getAddressById(UUID addressId) {

                User user = getAuthenticatedUser();

                Logger.printLog(LogLevel.INFO, LogStep.ADDRESS, "Fetch address request received",
                                "Fetching address by id", user.getId().toString(), addressId.toString());

                UserAddress address = userAddressRepository
                                .findByIdAndUserAndDeletedFalse(addressId, user)
                                .orElseThrow(() -> new ResourceNotFoundException("Address not found."));

                Logger.printLog(LogLevel.INFO, LogStep.ADDRESS, "Address fetched successfully", "Address retrieved",
                                user.getId().toString(), address.getId().toString());

                return addressMapper.toResponse(address);
        }

        @Override
        public AddressResponse updateAddress(UUID addressId, UpdateAddressRequest request) {

                User user = getAuthenticatedUser();

                Logger.printLog(LogLevel.INFO, LogStep.ADDRESS, "Update address request received", "Updating address",
                                user.getId().toString(), addressId.toString());

                UserAddress address = userAddressRepository
                                .findByIdAndUserAndDeletedFalse(addressId, user)
                                .orElseThrow(() -> new ResourceNotFoundException("Address not found."));

                addressMapper.updateEntity(request, address);

                UserAddress updatedAddress = userAddressRepository.save(address);

                Logger.printLog(LogLevel.INFO, LogStep.ADDRESS, "Address updated successfully", "Address updated",
                                user.getId().toString(), updatedAddress.getId().toString());

                return addressMapper.toResponse(updatedAddress);
        }

        @Override
        public void deleteAddress(UUID addressId) {

                User user = getAuthenticatedUser();

                Logger.printLog(LogLevel.INFO, LogStep.ADDRESS, "Delete address request received", "Deleting address",
                                user.getId().toString(), addressId.toString());

                UserAddress address = userAddressRepository
                                .findByIdAndUserAndDeletedFalse(addressId, user)
                                .orElseThrow(() -> new ResourceNotFoundException("Address not found."));

                boolean wasDefault = Boolean.TRUE.equals(address.getDefaultAddress());

                address.setDeleted(true);
                address.setDefaultAddress(false);

                Logger.printLog(LogLevel.INFO, LogStep.ADDRESS, "Address deleted successfully", "Soft delete completed",
                                user.getId().toString(), addressId.toString());

                userAddressRepository.save(address);

                if (wasDefault) {

                        List<UserAddress> remainingAddresses = userAddressRepository
                                        .findByUserAndDeletedFalseAndIdNot(user, addressId);

                        if (!remainingAddresses.isEmpty()) {

                                UserAddress newDefault = remainingAddresses.get(0);

                                newDefault.setDefaultAddress(true);

                                userAddressRepository.save(newDefault);

                                Logger.printLog(LogLevel.INFO, LogStep.ADDRESS, "Default address updated",
                                                "Another address promoted as default", user.getId().toString(),
                                                newDefault.getId().toString());

                        }
                }
        }

        @Override
        @Transactional
        public void setDefaultAddress(UUID addressId) {

                User user = getAuthenticatedUser();

                Logger.printLog(LogLevel.INFO, LogStep.ADDRESS, "Set default address request received",
                                "Updating default address", user.getId().toString(), addressId.toString());

                UserAddress newDefaultAddress = userAddressRepository
                                .findByIdAndUserAndDeletedFalse(addressId, user)
                                .orElseThrow(() -> new ResourceNotFoundException("Address not found."));

                // If already default, nothing to do
                if (Boolean.TRUE.equals(newDefaultAddress.getDefaultAddress())) {
                        Logger.printLog(LogLevel.INFO, LogStep.ADDRESS, "Address is already default",
                                        "No update required", user.getId().toString(), addressId.toString());
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

                Logger.printLog(LogLevel.INFO, LogStep.ADDRESS, "Default address updated successfully",
                                "New default address assigned", user.getId().toString(),
                                newDefaultAddress.getId().toString());

        }

        protected User getAuthenticatedUser() {

                UserPrincipal currentUser = authenticationFacade.getCurrentUser();

                return userRepository.findById(currentUser.getId())
                                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        }

}