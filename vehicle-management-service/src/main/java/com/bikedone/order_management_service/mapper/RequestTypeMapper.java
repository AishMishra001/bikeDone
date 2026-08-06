package com.bikedone.order_management_service.mapper;

import com.bikedone.order_management_service.dto.response.RequestTypeResponse;
import com.bikedone.order_management_service.entity.RequestType;

public class RequestTypeMapper {

    public static RequestTypeResponse toResponse(RequestType entity) {

        return new RequestTypeResponse(
                entity.getId(),
                entity.getRequestTypeCode().name(),
                entity.getDisplayName(),
                entity.getDescription()
        );
    }

}