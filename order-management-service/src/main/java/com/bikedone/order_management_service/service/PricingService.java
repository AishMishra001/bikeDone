package com.bikedone.order_management_service.service;

import com.bikedone.order_management_service.dto.response.ItemResponse;
import com.bikedone.order_management_service.dto.response.PricingEstimateResponse;
import com.bikedone.order_management_service.entity.OrderBillBreakdown;

import java.util.List;
import java.util.UUID;

public interface PricingService {
    List<ItemResponse> getAllActiveItems();
    PricingEstimateResponse calculatePricingEstimate(UUID itemId, String itemCode, Long requestTypeId, String requestTypeCode, String couponCode);
    OrderBillBreakdown createOrderBillSnapshot(UUID serviceRequestId, UUID userId, UUID itemId, Long requestTypeId, String couponCode);
    OrderBillBreakdown createOrderBillSnapshot(UUID serviceRequestId, UUID userId, UUID itemId, Long requestTypeId, String couponCode, java.math.BigDecimal extraAmount);
    OrderBillBreakdown updateExtraAmount(UUID serviceRequestId, java.math.BigDecimal extraAmount);
}
