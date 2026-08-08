package com.bikedone.order_management_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PendingJobNotificationResponse {
    private UUID requestId;
    private String customerName;
    private String customerMobile;
    private String issueDescription;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String addressNote;
    private Integer dispatchRound;
    private Integer timeoutSeconds;
}
