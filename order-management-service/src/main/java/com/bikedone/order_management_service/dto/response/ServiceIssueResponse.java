package com.bikedone.order_management_service.dto.response;

import lombok.Builder;

@Builder
public record ServiceIssueResponse(

        Long id,

        String code,

        String displayName

) {
}