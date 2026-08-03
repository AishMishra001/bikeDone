package com.bikedone.vehicle_management_service.service.impl;

import com.bikedone.vehicle_management_service.common.logging.LogLevel;
import com.bikedone.vehicle_management_service.common.logging.LogStep;
import com.bikedone.vehicle_management_service.common.logging.Logger;
import com.bikedone.vehicle_management_service.dto.response.VehicleBrandResponse;
import com.bikedone.vehicle_management_service.entity.VehicleBrand;
import com.bikedone.vehicle_management_service.mapper.VehicleBrandMapper;
import com.bikedone.vehicle_management_service.repository.VehicleBrandRepository;
import com.bikedone.vehicle_management_service.service.VehicleBrandService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleBrandServiceImpl implements VehicleBrandService {

    private final VehicleBrandRepository vehicleBrandRepository;
    private final VehicleBrandMapper vehicleBrandMapper;

    @Override
    public List<VehicleBrandResponse> getAllBrands() {

        Logger.printLog(
                LogLevel.INFO,
                LogStep.VEHICLE_BRAND,
                "Fetching all vehicle brands",
                "Querying active brands ordered by brandName",
                null,
                null
        );

        List<VehicleBrand> brands =
                vehicleBrandRepository.findAllByIsActiveTrueOrderByBrandNameAsc();

        List<VehicleBrandResponse> result = vehicleBrandMapper.toResponse(brands);

        Logger.printLog(
                LogLevel.INFO,
                LogStep.VEHICLE_BRAND,
                "Vehicle brands fetched successfully",
                "Returned " + result.size() + " brand(s)",
                null,
                null
        );

        return result;
    }
}
