package com.bikedone.vehicle_management_service.mapper;

import com.bikedone.vehicle_management_service.dto.response.VehicleModelResponse;
import com.bikedone.vehicle_management_service.entity.VehicleModel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface VehicleModelMapper {

    @Mapping(source = "fuelType.displayName", target = "fuelType")
    @Mapping(source = "transmissionType.displayName", target = "transmissionType")
    VehicleModelResponse toResponse(VehicleModel vehicleModel);

    List<VehicleModelResponse> toResponse(List<VehicleModel> vehicleModels);
}