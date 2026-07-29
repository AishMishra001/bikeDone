package com.bikedone.vehicle_management_service.service.impl;

import com.bikedone.vehicle_management_service.dto.request.UpdateCustomerVehicleRequest;
import com.bikedone.vehicle_management_service.exception.BadRequestException;
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
import lombok.extern.slf4j.Slf4j;

import java.time.Year;
import java.util.List;
import java.util.UUID;

@Slf4j
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

    @Override
    @Transactional(readOnly = true)
    public List<CustomerVehicleResponse> getMyVehicles() {

        UUID userId = authenticationFacade.getCurrentUserId();

        log.info("Fetching vehicles for userId={}", userId);

        List<CustomerVehicle> customerVehicles =
                customerVehicleRepository.findByUserIdAndIsActiveTrueOrderByIsDefaultDescCreatedAtDesc(userId);

        log.info("Found {} active vehicle(s) for userId={}", customerVehicles.size(), userId);

        return customerVehicles.stream()
                .map(customerVehicleMapper::toResponse)
                .toList();
    }

    /**
     * Returns all active vehicles of the authenticated customer.
     */
    @Override
    @Transactional(readOnly = true)
    public CustomerVehicleResponse getVehicleById(UUID vehicleId) {

        UUID userId = authenticationFacade.getCurrentUserId();

        log.info("Fetching vehicle details for vehicleId={} and userId={}", vehicleId, userId);

        CustomerVehicle customerVehicle = getCustomerVehicle(vehicleId, userId);

        log.info("Vehicle details fetched successfully. vehicleId={}, userId={}", vehicleId, userId);

        return customerVehicleMapper.toResponse(customerVehicle);
    }


    @Override
    @Transactional
    public CustomerVehicleResponse updateVehicle(
            UUID vehicleId,
            UpdateCustomerVehicleRequest request) {

        UUID userId = authenticationFacade.getCurrentUserId();

        log.info("Updating vehicle. vehicleId={}, userId={}", vehicleId, userId);

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

        log.info("Vehicle updated successfully. vehicleId={}, userId={}",
                vehicleId,
                userId);

        return customerVehicleMapper.toResponse(updatedVehicle);
    }

    private CustomerVehicle getCustomerVehicle(
            UUID vehicleId,
            UUID userId) {

        return customerVehicleRepository
                .findByIdAndUserIdAndIsActiveTrue(vehicleId, userId)
                .orElseThrow(() -> {
                    log.info("Vehicle not found. vehicleId={}, userId={}", vehicleId,userId);
                    return new ResourceNotFoundException(
                            "Vehicle not found."
                    );
                });
    }

    @Override
    @Transactional
    public CustomerVehicleResponse setDefaultVehicle(UUID vehicleId) {

        UUID userId = authenticationFacade.getCurrentUserId();

        log.info("Setting default vehicle. vehicleId={}, userId={}", vehicleId, userId);

        CustomerVehicle customerVehicle = getCustomerVehicle(vehicleId, userId);

        if (Boolean.TRUE.equals(customerVehicle.getIsDefault())) {

            log.info("Vehicle is already default. vehicleId={}, userId={}", vehicleId, userId);

            return customerVehicleMapper.toResponse(customerVehicle);
        }

        customerVehicleRepository.clearDefaultVehicle(userId);

        customerVehicle.setIsDefault(true);

        CustomerVehicle updatedVehicle = customerVehicleRepository.save(customerVehicle);

        log.info("Default vehicle updated successfully. vehicleId={}, userId={}", vehicleId, userId);

        return customerVehicleMapper.toResponse(updatedVehicle);
    }

    @Override
    @Transactional
    public void deleteVehicle(UUID vehicleId) {

        UUID userId = authenticationFacade.getCurrentUserId();

        log.info("Deleting vehicle. vehicleId={}, userId={}", vehicleId, userId);

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

                        log.info(
                                "Assigned new default vehicle. vehicleId={}, userId={}",
                                vehicle.getId(),
                                userId
                        );
                    });
        }

        log.info("Vehicle deleted successfully. vehicleId={}, userId={}",vehicleId, userId);
    }

}