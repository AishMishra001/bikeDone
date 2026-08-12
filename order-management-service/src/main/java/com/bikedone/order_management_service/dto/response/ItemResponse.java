package com.bikedone.order_management_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemResponse {
    private UUID id;
    private Long categoryId;
    private String categoryCode;
    private String categoryDisplayName;
    private String itemCode;
    private String displayName;
    private String description;
}
