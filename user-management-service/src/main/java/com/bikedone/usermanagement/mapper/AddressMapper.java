package com.bikedone.usermanagement.mapper;

import com.bikedone.usermanagement.dto.request.CreateAddressRequest;
import com.bikedone.usermanagement.dto.request.UpdateAddressRequest;
import com.bikedone.usermanagement.dto.response.AddressResponse;
import com.bikedone.usermanagement.entity.UserAddress;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface AddressMapper {

    UserAddress toEntity(CreateAddressRequest request);

    AddressResponse toResponse(UserAddress address);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(UpdateAddressRequest request, @MappingTarget UserAddress address);
}