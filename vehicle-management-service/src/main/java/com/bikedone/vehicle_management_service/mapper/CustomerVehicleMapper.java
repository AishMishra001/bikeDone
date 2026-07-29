package com.bikedone.vehicle_management_service.mapper;

import com.bikedone.vehicle_management_service.dto.response.CustomerVehicleResponse;
import com.bikedone.vehicle_management_service.entity.CustomerVehicle;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CustomerVehicleMapper {

    @Mapping(source = "brand.brandName", target = "brandName")
    @Mapping(source = "model.modelName", target = "modelName")
    CustomerVehicleResponse toResponse(CustomerVehicle customerVehicle);

}