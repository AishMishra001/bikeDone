package com.bikedone.vehicle_management_service.service.impl;

import com.bikedone.vehicle_management_service.common.logging.LogLevel;
import com.bikedone.vehicle_management_service.common.logging.LogStep;
import com.bikedone.vehicle_management_service.common.logging.Logger;
import com.bikedone.vehicle_management_service.dto.response.VehicleModelResponse;
import com.bikedone.vehicle_management_service.entity.VehicleBrand;
import com.bikedone.vehicle_management_service.entity.VehicleModel;
import com.bikedone.vehicle_management_service.exception.ResourceNotFoundException;
import com.bikedone.vehicle_management_service.mapper.VehicleModelMapper;
import com.bikedone.vehicle_management_service.repository.VehicleBrandRepository;
import com.bikedone.vehicle_management_service.repository.VehicleModelRepository;
import com.bikedone.vehicle_management_service.service.VehicleModelService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VehicleModelServiceImpl implements VehicleModelService {

    private final VehicleBrandRepository vehicleBrandRepository;

    private final VehicleModelRepository vehicleModelRepository;

    private final VehicleModelMapper vehicleModelMapper;

    @Transactional(readOnly = true)
    @Override
    public List<VehicleModelResponse> getVehicleModels(UUID brandId) {

        Logger.printLog(
                LogLevel.INFO,
                LogStep.VEHICLE_MODEL,
                "Fetching vehicle models",
                "brandId=" + brandId,
                null,
                brandId.toString()
        );

        VehicleBrand brand = vehicleBrandRepository
                .findByIdAndIsActiveTrue(brandId)
                .orElseThrow(() -> {
                    Logger.printLog(
                            LogLevel.WARN,
                            LogStep.VEHICLE_MODEL,
                            "Vehicle brand not found",
                            "brandId=" + brandId,
                            null,
                            brandId.toString()
                    );
                    return new ResourceNotFoundException("Vehicle brand not found.");
                });

        List<VehicleModel> models =
                vehicleModelRepository.findActiveModelsByBrandId(brand.getId());

        List<VehicleModelResponse> result = vehicleModelMapper.toResponse(models);

        Logger.printLog(
                LogLevel.INFO,
                LogStep.VEHICLE_MODEL,
                "Vehicle models fetched successfully",
                "Returned " + result.size() + " model(s) for brandId=" + brandId,
                null,
                brandId.toString()
        );

        return result;
    }
}
