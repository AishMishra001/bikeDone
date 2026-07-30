package com.bikedone.vehicle_management_service.service.impl;

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

        List<VehicleBrand> brands = vehicleBrandRepository.findAllByIsActiveTrueOrderByBrandNameAsc();

        return vehicleBrandMapper.toResponse(brands);
    }
}