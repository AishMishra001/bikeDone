package com.bikedone.order_management_service.controller;

import com.bikedone.order_management_service.common.response.ApiResponse;
import com.bikedone.order_management_service.dto.response.ItemResponse;
import com.bikedone.order_management_service.dto.response.PricingEstimateResponse;
import com.bikedone.order_management_service.service.PricingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pricing")
@RequiredArgsConstructor
public class PricingController {

    private final PricingService pricingService;

    @GetMapping("/items")
    public ResponseEntity<ApiResponse<List<ItemResponse>>> getActiveItems() {
        List<ItemResponse> items = pricingService.getAllActiveItems();
        return ResponseEntity.ok(ApiResponse.success(items, "Items fetched successfully."));
    }

    @GetMapping("/estimate")
    public ResponseEntity<ApiResponse<PricingEstimateResponse>> getPricingEstimate(
            @RequestParam(required = false) UUID itemId,
            @RequestParam(required = false) String itemCode,
            @RequestParam(required = false) Long requestTypeId,
            @RequestParam(required = false) String requestTypeCode,
            @RequestParam(required = false) String couponCode) {

        PricingEstimateResponse estimate = pricingService.calculatePricingEstimate(
                itemId, itemCode, requestTypeId, requestTypeCode, couponCode);

        return ResponseEntity.ok(ApiResponse.success(estimate, "Pricing estimate calculated successfully."));
    }
}
