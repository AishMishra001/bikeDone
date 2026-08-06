package com.bikedone.order_management_service.mapper;

import com.bikedone.order_management_service.dto.response.VehicleBrandResponse;
import com.bikedone.order_management_service.entity.VehicleBrand;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface VehicleBrandMapper {

    VehicleBrandResponse toResponse(VehicleBrand vehicleBrand);

    List<VehicleBrandResponse> toResponse(List<VehicleBrand> vehicleBrands);

}