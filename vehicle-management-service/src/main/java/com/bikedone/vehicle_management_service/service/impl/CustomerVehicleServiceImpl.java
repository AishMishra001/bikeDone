package com.bikedone.vehicle_management_service.service.impl;

import com.bikedone.vehicle_management_service.exception.ResourceNotFoundException;
import com.bikedone.vehicle_management_service.dto.request.CreateCustomerVehicleRequest;
import com.bikedone.vehicle_management_service.dto.response.CustomerVehicleResponse;
import com.bikedone.vehicle_management_service.entity.CustomerVehicle;
import com.bikedone.vehicle_management_service.mapper.CustomerVehicleMapper;
import com.bikedone.vehicle_management_service.repository.CustomerVehicleRepository;
import com.bikedone.vehicle_management_service.security.authentication.AuthenticationFacade;
import com.bikedone.vehicle_management_service.service.CustomerVehicleService;
import com.bikedone.vehicle_management_service.validation.CustomerVehicleValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        String registrationNumber = request.getRegistrationNumber()
                .trim()
                .toUpperCase();

        String engineNumber = request.getEngineNumber() != null
                ? request.getEngineNumber().trim().toUpperCase()
                : null;

        String chassisNumber = request.getChassisNumber() != null
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

        return customerVehicleMapper.toResponse(vehicleWithAssociations);
    }

}