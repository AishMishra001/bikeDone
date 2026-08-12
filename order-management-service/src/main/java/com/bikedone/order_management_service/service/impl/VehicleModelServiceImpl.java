package com.bikedone.order_management_service.service.impl;

import com.bikedone.order_management_service.common.logging.LogLevel;
import com.bikedone.order_management_service.common.logging.LogStep;
import com.bikedone.order_management_service.common.logging.Logger;
import com.bikedone.order_management_service.dto.response.VehicleModelResponse;
import com.bikedone.order_management_service.entity.VehicleBrand;
import com.bikedone.order_management_service.entity.VehicleModel;
import com.bikedone.order_management_service.exception.ResourceNotFoundException;
import com.bikedone.order_management_service.mapper.VehicleModelMapper;
import com.bikedone.order_management_service.repository.VehicleBrandRepository;
import com.bikedone.order_management_service.repository.VehicleModelRepository;
import com.bikedone.order_management_service.service.VehicleModelService;
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
        return getVehicleModels(brandId, null);
    }

    @Transactional(readOnly = true)
    @Override
    public List<VehicleModelResponse> getVehicleModels(UUID brandId, UUID itemId) {

        Logger.printLog(
                LogLevel.INFO,
                LogStep.VEHICLE_MODEL,
                "Fetching vehicle models",
                "brandId=" + brandId + ", itemId=" + itemId,
                null,
                brandId != null ? brandId.toString() : null
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
                            brandId != null ? brandId.toString() : null
                    );
                    return new ResourceNotFoundException("Vehicle brand not found.");
                });

        List<VehicleModel> models = (itemId != null)
                ? vehicleModelRepository.findActiveModelsByBrandIdAndItemId(brand.getId(), itemId)
                : vehicleModelRepository.findActiveModelsByBrandId(brand.getId());

        List<VehicleModelResponse> result = vehicleModelMapper.toResponse(models);

        Logger.printLog(
                LogLevel.INFO,
                LogStep.VEHICLE_MODEL,
                "Vehicle models fetched successfully",
                "Returned " + result.size() + " model(s) for brandId=" + brandId + ", itemId=" + itemId,
                null,
                brandId != null ? brandId.toString() : null
        );

        return result;
    }
}
