package com.bikedone.order_management_service.validation;

import com.bikedone.order_management_service.entity.VehicleBrand;
import com.bikedone.order_management_service.entity.VehicleModel;
import com.bikedone.order_management_service.exception.BadRequestException;
import com.bikedone.order_management_service.exception.ConflictException;
import com.bikedone.order_management_service.exception.ResourceNotFoundException;
import com.bikedone.order_management_service.repository.CustomerVehicleRepository;
import com.bikedone.order_management_service.repository.VehicleBrandRepository;
import com.bikedone.order_management_service.repository.VehicleModelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Year;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CustomerVehicleValidator {

    private final VehicleBrandRepository vehicleBrandRepository;
    private final VehicleModelRepository vehicleModelRepository;
    private final CustomerVehicleRepository customerVehicleRepository;

    public VehicleBrand validateBrand(UUID brandId) {

        return vehicleBrandRepository.findByIdAndIsActiveTrue(brandId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Vehicle brand not found."));
    }

    public VehicleModel validateModel(UUID modelId) {

        return vehicleModelRepository.findByIdAndIsActiveTrue(modelId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Vehicle model not found."));
    }

    public void validateBrandModelMapping(
            VehicleBrand brand,
            VehicleModel model) {

        if (!model.getBrand().getId().equals(brand.getId())) {
            throw new ConflictException(
                    "Selected vehicle model does not belong to selected brand.");
        }
    }

    public void validateRegistrationNumber(String registrationNumber) {

        if (customerVehicleRepository.existsByRegistrationNumberIgnoreCase(
                registrationNumber)) {

            throw new ConflictException(
                    "Vehicle with same registration number already exists.");
        }
    }

    public void validateEngineNumber(String engineNumber) {

        if (engineNumber == null || engineNumber.isBlank()) {
            return;
        }

        if (customerVehicleRepository.existsByEngineNumberIgnoreCase(engineNumber)) {

            throw new ConflictException(
                    "Vehicle with same engine number already exists.");
        }
    }

    public void validateChassisNumber(String chassisNumber) {

        if (chassisNumber == null || chassisNumber.isBlank()) {
            return;
        }

        if (customerVehicleRepository.existsByChassisNumberIgnoreCase(chassisNumber)) {

            throw new ConflictException(
                    "Vehicle with same chassis number already exists.");
        }
    }

    public void validateManufacturingYear(Integer manufacturingYear) {

        if (manufacturingYear > Year.now().getValue()) {
            throw new BadRequestException("Manufacturing year cannot be in the future.");
        }
    }

    public void validateOdometer(
            Integer existingOdometer,
            Integer newOdometer) {

        if (newOdometer < existingOdometer) {
            throw new BadRequestException(
                    "Odometer reading cannot be less than existing reading."
            );
        }
    }
}