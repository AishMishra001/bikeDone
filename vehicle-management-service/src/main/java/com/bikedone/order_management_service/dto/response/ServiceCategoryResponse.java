package com.bikedone.order_management_service.dto.response;

import lombok.Builder;

@Builder
public record ServiceCategoryResponse(

        Long id,

        String code,

        String displayName,

        String iconUrl

) {
}