package com.bikedone.order_management_service.mapper;

import com.bikedone.order_management_service.dto.response.ServiceCategoryResponse;
import com.bikedone.order_management_service.entity.ServiceCategory;

public class ServiceCategoryMapper {

    private ServiceCategoryMapper() {
        // Prevent instantiation
    }

    public static ServiceCategoryResponse toResponse(ServiceCategory entity) {

        return ServiceCategoryResponse.builder()
                .id(entity.getId())
                .code(entity.getCategoryCode())
                .displayName(entity.getDisplayName())
                .iconUrl(entity.getIconUrl())
                .build();
    }
}