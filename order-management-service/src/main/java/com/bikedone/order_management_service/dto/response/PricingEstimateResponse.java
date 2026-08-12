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
public class PricingEstimateResponse {
    private UUID itemId;
    private String itemCode;
    private String itemDisplayName;

    private Long requestTypeId;
    private String requestTypeCode;
    private String requestTypeDisplayName;

    private BigDecimal baseCharge;
    private BigDecimal convenienceFee;
    private BigDecimal platformFee;

    private BigDecimal subtotal;

    private BigDecimal discountAmount;
    private String appliedCouponCode;
    private String couponTitle;

    private BigDecimal taxableAmount;

    private BigDecimal gstPercentage;
    private BigDecimal gstAmount;
    private BigDecimal cgstAmount;
    private BigDecimal sgstAmount;

    private BigDecimal totalPayableAmount;

    private Boolean couponApplied;
    private String couponMessage;
}
