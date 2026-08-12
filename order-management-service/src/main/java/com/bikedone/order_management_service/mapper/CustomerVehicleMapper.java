package com.bikedone.order_management_service.mapper;

import com.bikedone.order_management_service.dto.response.CustomerVehicleResponse;
import com.bikedone.order_management_service.entity.CustomerVehicle;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CustomerVehicleMapper {

    @Mapping(source = "brand.brandName", target = "brandName")
    @Mapping(source = "model.modelName", target = "modelName")
    @Mapping(source = "item.id", target = "itemId")
    @Mapping(source = "item.itemCode", target = "itemCode")
    @Mapping(source = "item.displayName", target = "itemDisplayName")
    CustomerVehicleResponse toResponse(CustomerVehicle customerVehicle);

}