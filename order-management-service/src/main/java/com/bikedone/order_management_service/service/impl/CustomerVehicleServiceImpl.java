package com.bikedone.order_management_service.service.impl;

import com.bikedone.order_management_service.common.logging.LogLevel;
import com.bikedone.order_management_service.common.logging.LogStep;
import com.bikedone.order_management_service.common.logging.Logger;
import com.bikedone.order_management_service.dto.request.UpdateCustomerVehicleRequest;
import com.bikedone.order_management_service.exception.ResourceNotFoundException;
import com.bikedone.order_management_service.dto.request.CreateCustomerVehicleRequest;
import com.bikedone.order_management_service.dto.response.CustomerVehicleResponse;
import com.bikedone.order_management_service.entity.CustomerVehicle;
import com.bikedone.order_management_service.mapper.CustomerVehicleMapper;
import com.bikedone.order_management_service.repository.CustomerVehicleRepository;
import com.bikedone.order_management_service.security.authentication.AuthenticationFacade;
import com.bikedone.order_management_service.service.CustomerVehicleService;
import com.bikedone.order_management_service.validation.CustomerVehicleValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomerVehicleServiceImpl implements CustomerVehicleService {

    private final CustomerVehicleRepository customerVehicleRepository;
    private final CustomerVehicleValidator customerVehicleValidator;
    private final CustomerVehicleMapper customerVehicleMapper;
    private final AuthenticationFacade authenticationFacade;

    @Override
    public CustomerVehicleResponse createVehicle(
            CreateCustomerVehicleRequest request) {

        UUID userId = authenticationFacade.getCurrentUserId();

        Logger.printLog(
                LogLevel.INFO,
                LogStep.CUSTOMER_VEHICLE,
                "Creating vehicle",
                "userId=" + userId + " | registrationNumber=" + request.getRegistrationNumber(),
                userId.toString(),
                null
        );

        String registrationNumber = request.getRegistrationNumber()
                .trim()
                .toUpperCase();

        String engineNumber = request.getEngineNumber() != null && !request.getEngineNumber().trim().isEmpty()
                ? request.getEngineNumber().trim().toUpperCase()
                : null;

        String chassisNumber = request.getChassisNumber() != null && !request.getChassisNumber().trim().isEmpty()
                ? request.getChassisNumber().trim().toUpperCase()
                : null;

        var brand = customerVehicleValidator.validateBrand(request.getBrandId());

        var model = customerVehicleValidator.validateModel(request.getModelId());

        customerVehicleValidator.validateBrandModelMapping(brand, model);

        customerVehicleValidator.validateRegistrationNumber(registrationNumber);

        customerVehicleValidator.validateEngineNumber(engineNumber);

        customerVehicleValidator.validateChassisNumber(chassisNumber);

        CustomerVehicle customerVehicle = new CustomerVehicle();

        customerVehicle.setUserId(userId);
        customerVehicle.setBrand(brand);
        customerVehicle.setModel(model);
        customerVehicle.setRegistrationNumber(registrationNumber);
        customerVehicle.setManufacturingYear(request.getManufacturingYear());
        customerVehicle.setColor(request.getColor());
        customerVehicle.setEngineNumber(engineNumber);
        customerVehicle.setChassisNumber(chassisNumber);
        customerVehicle.setOdometerKm(request.getOdometerKm());

        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            java.util.Map<String, Object> vehicleData = new java.util.HashMap<>();
            vehicleData.put("customer-bike-image", request.getImageUrls());
            customerVehicle.setVehicleData(vehicleData);
        }

        long totalVehicles =
                customerVehicleRepository.countByUserIdAndIsActiveTrue(userId);

        if (totalVehicles == 0) {

            customerVehicle.setIsDefault(true);

        } else {

            customerVehicle.setIsDefault(request.getIsDefault());

            if (Boolean.TRUE.equals(request.getIsDefault())) {

                customerVehicleRepository.clearDefaultVehicle(userId);
            }
        }

        CustomerVehicle savedVehicle = customerVehicleRepository.save(customerVehicle);

        CustomerVehicle vehicleWithAssociations = customerVehicleRepository
                .findByIdWithAssociations(savedVehicle.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found."));

        Logger.printLog(
                LogLevel.INFO,
                LogStep.CUSTOMER_VEHICLE,
                "Vehicle created successfully",
                "vehicleId=" + savedVehicle.getId() + " | userId=" + userId,
                userId.toString(),
                savedVehicle.getId().toString()
        );

        return customerVehicleMapper.toResponse(vehicleWithAssociations);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerVehicleResponse> getMyVehicles() {

        UUID userId = authenticationFacade.getCurrentUserId();

        Logger.printLog(
                LogLevel.INFO,
                LogStep.CUSTOMER_VEHICLE,
                "Fetching vehicles for user",
                "userId=" + userId,
                userId.toString(),
                null
        );

        List<CustomerVehicle> customerVehicles =
                customerVehicleRepository.findByUserIdAndIsActiveTrueOrderByIsDefaultDescCreatedAtDesc(userId);

        Logger.printLog(
                LogLevel.INFO,
                LogStep.CUSTOMER_VEHICLE,
                "Vehicles fetched successfully",
                "Found " + customerVehicles.size() + " active vehicle(s) for userId=" + userId,
                userId.toString(),
                null
        );

        return customerVehicles.stream()
                .map(customerVehicleMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerVehicleResponse getVehicleById(UUID vehicleId) {

        UUID userId = authenticationFacade.getCurrentUserId();

        Logger.printLog(
                LogLevel.INFO,
                LogStep.CUSTOMER_VEHICLE,
                "Fetching vehicle by ID",
                "vehicleId=" + vehicleId + " | userId=" + userId,
                userId.toString(),
                vehicleId.toString()
        );

        CustomerVehicle customerVehicle = getCustomerVehicle(vehicleId, userId);

        Logger.printLog(
                LogLevel.INFO,
                LogStep.CUSTOMER_VEHICLE,
                "Vehicle details fetched successfully",
                "vehicleId=" + vehicleId + " | userId=" + userId,
                userId.toString(),
                vehicleId.toString()
        );

        return customerVehicleMapper.toResponse(customerVehicle);
    }

    @Override
    @Transactional
    public CustomerVehicleResponse updateVehicle(
            UUID vehicleId,
            UpdateCustomerVehicleRequest request) {

        UUID userId = authenticationFacade.getCurrentUserId();

        Logger.printLog(
                LogLevel.INFO,
                LogStep.CUSTOMER_VEHICLE,
                "Updating vehicle",
                "vehicleId=" + vehicleId + " | userId=" + userId,
                userId.toString(),
                vehicleId.toString()
        );

        CustomerVehicle customerVehicle = getCustomerVehicle(vehicleId, userId);

        customerVehicleValidator.validateManufacturingYear(
                request.getManufacturingYear());

        customerVehicleValidator.validateOdometer(
                customerVehicle.getOdometerKm(),
                request.getOdometerKm());

        String color = request.getColor().trim();

        customerVehicle.setColor(color);
        customerVehicle.setManufacturingYear(request.getManufacturingYear());
        customerVehicle.setOdometerKm(request.getOdometerKm());

        CustomerVehicle updatedVehicle =
                customerVehicleRepository.save(customerVehicle);

        Logger.printLog(
                LogLevel.INFO,
                LogStep.CUSTOMER_VEHICLE,
                "Vehicle updated successfully",
                "vehicleId=" + vehicleId + " | userId=" + userId,
                userId.toString(),
                vehicleId.toString()
        );

        return customerVehicleMapper.toResponse(updatedVehicle);
    }

    private CustomerVehicle getCustomerVehicle(
            UUID vehicleId,
            UUID userId) {

        return customerVehicleRepository
                .findByIdAndUserIdAndIsActiveTrue(vehicleId, userId)
                .orElseThrow(() -> {
                    Logger.printLog(
                            LogLevel.WARN,
                            LogStep.CUSTOMER_VEHICLE,
                            "Vehicle not found",
                            "vehicleId=" + vehicleId + " | userId=" + userId,
                            userId.toString(),
                            vehicleId.toString()
                    );
                    return new ResourceNotFoundException("Vehicle not found.");
                });
    }

    @Override
    @Transactional
    public CustomerVehicleResponse setDefaultVehicle(UUID vehicleId) {

        UUID userId = authenticationFacade.getCurrentUserId();

        Logger.printLog(
                LogLevel.INFO,
                LogStep.CUSTOMER_VEHICLE,
                "Setting default vehicle",
                "vehicleId=" + vehicleId + " | userId=" + userId,
                userId.toString(),
                vehicleId.toString()
        );

        CustomerVehicle customerVehicle = getCustomerVehicle(vehicleId, userId);

        if (Boolean.TRUE.equals(customerVehicle.getIsDefault())) {

            Logger.printLog(
                    LogLevel.INFO,
                    LogStep.CUSTOMER_VEHICLE,
                    "Vehicle is already set as default",
                    "vehicleId=" + vehicleId + " | userId=" + userId,
                    userId.toString(),
                    vehicleId.toString()
            );

            return customerVehicleMapper.toResponse(customerVehicle);
        }

        customerVehicleRepository.clearDefaultVehicle(userId);

        customerVehicle.setIsDefault(true);

        CustomerVehicle updatedVehicle = customerVehicleRepository.save(customerVehicle);

        Logger.printLog(
                LogLevel.INFO,
                LogStep.CUSTOMER_VEHICLE,
                "Default vehicle updated successfully",
                "vehicleId=" + vehicleId + " | userId=" + userId,
                userId.toString(),
                vehicleId.toString()
        );

        return customerVehicleMapper.toResponse(updatedVehicle);
    }

    @Override
    @Transactional
    public void deleteVehicle(UUID vehicleId) {

        UUID userId = authenticationFacade.getCurrentUserId();

        Logger.printLog(
                LogLevel.INFO,
                LogStep.CUSTOMER_VEHICLE,
                "Deleting vehicle",
                "vehicleId=" + vehicleId + " | userId=" + userId,
                userId.toString(),
                vehicleId.toString()
        );

        CustomerVehicle customerVehicle = getCustomerVehicle(vehicleId, userId);

        boolean wasDefault = Boolean.TRUE.equals(customerVehicle.getIsDefault());

        customerVehicle.setIsActive(false);
        customerVehicle.setIsDefault(false);

        customerVehicleRepository.save(customerVehicle);

        if (wasDefault) {

            customerVehicleRepository
                    .findFirstByUserIdAndIsActiveTrueOrderByCreatedAtAsc(userId)
                    .ifPresent(vehicle -> {

                        vehicle.setIsDefault(true);

                        customerVehicleRepository.save(vehicle);

                        Logger.printLog(
                                LogLevel.INFO,
                                LogStep.CUSTOMER_VEHICLE,
                                "Assigned new default vehicle",
                                "newDefaultVehicleId=" + vehicle.getId() + " | userId=" + userId,
                                userId.toString(),
                                vehicle.getId().toString()
                        );
                    });
        }

        Logger.printLog(
                LogLevel.INFO,
                LogStep.CUSTOMER_VEHICLE,
                "Vehicle deleted successfully",
                "vehicleId=" + vehicleId + " | userId=" + userId,
                userId.toString(),
                vehicleId.toString()
        );
    }
}
