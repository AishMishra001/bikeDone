package com.bikedone.order_management_service.service.impl;

import com.bikedone.order_management_service.common.logging.LogLevel;
import com.bikedone.order_management_service.common.logging.LogStep;
import com.bikedone.order_management_service.common.logging.Logger;
import com.bikedone.order_management_service.dto.response.ItemResponse;
import com.bikedone.order_management_service.dto.response.PricingEstimateResponse;
import com.bikedone.order_management_service.entity.*;
import com.bikedone.order_management_service.enums.RequestTypeCode;
import com.bikedone.order_management_service.repository.*;
import com.bikedone.order_management_service.security.authentication.AuthenticationFacade;
import com.bikedone.order_management_service.service.PricingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PricingServiceImpl implements PricingService {

    private final ItemRepository itemRepository;
    private final RequestTypeRepository requestTypeRepository;
    private final ServicePricingRuleRepository servicePricingRuleRepository;
    private final CouponRepository couponRepository;
    private final CouponApplicabilityRuleRepository couponApplicabilityRuleRepository;
    private final UserCouponRedemptionRepository userCouponRedemptionRepository;
    private final OrderBillBreakdownRepository orderBillBreakdownRepository;
    private final AuthenticationFacade authenticationFacade;

    @Override
    @Transactional(readOnly = true)
    public List<ItemResponse> getAllActiveItems() {
        return itemRepository.findByIsActiveTrue().stream()
                .map(item -> ItemResponse.builder()
                        .id(item.getId())
                        .categoryId(item.getCategory() != null ? item.getCategory().getId() : null)
                        .categoryCode(item.getCategory() != null ? item.getCategory().getCategoryCode() : null)
                        .categoryDisplayName(item.getCategory() != null ? item.getCategory().getDisplayName() : null)
                        .itemCode(item.getItemCode())
                        .displayName(item.getDisplayName())
                        .description(item.getDescription())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PricingEstimateResponse calculatePricingEstimate(
            UUID itemId, String itemCode, Long requestTypeId, String requestTypeCode, String couponCode) {

        Logger.printLog(
                LogLevel.INFO,
                LogStep.SERVICE_REQUEST,
                "Calculate pricing estimate request",
                "itemId=" + itemId + ", itemCode=" + itemCode + ", requestTypeId=" + requestTypeId + ", requestTypeCode=" + requestTypeCode + ", couponCode=" + couponCode,
                null,
                null
        );

        // 1. Resolve Item
        Item item = resolveItem(itemId, itemCode);

        // 2. Resolve Request Type
        RequestType requestType = resolveRequestType(requestTypeId, requestTypeCode);

        if (item == null || requestType == null) {
            throw new IllegalArgumentException("Item or RequestType cannot be null");
        }

        ServicePricingRule rule = servicePricingRuleRepository
                .findByItemIdAndRequestTypeIdAndIsActiveTrue(item.getId(), requestType.getId())
                .orElseThrow(() -> new RuntimeException("Pricing rule not found for Item ID: " + item.getId() + " and Request Type ID: " + requestType.getId()));

        BigDecimal baseCharge = rule.getBaseCharge();
        BigDecimal convenienceFee = rule.getConvenienceFee();
        BigDecimal platformFee = rule.getPlatformFee();
        BigDecimal gstPercentage = rule.getGstPercentage();

        BigDecimal subtotal = baseCharge.add(convenienceFee).add(platformFee);

        // 4. Handle Coupon Validation & Calculation
        BigDecimal discountAmount = BigDecimal.ZERO;
        boolean couponApplied = false;
        String couponMessage = null;
        String appliedCouponCode = null;
        String couponTitle = null;

        if (couponCode != null && !couponCode.trim().isEmpty()) {
            Optional<Coupon> couponOpt = couponRepository.findByCouponCodeIgnoreCaseAndIsActiveTrue(couponCode.trim());
            if (couponOpt.isPresent()) {
                Coupon coupon = couponOpt.get();

                // Check min order amount
                if (subtotal.compareTo(coupon.getMinOrderAmount()) < 0) {
                    couponMessage = "Minimum order amount of ₹" + coupon.getMinOrderAmount() + " required for coupon " + coupon.getCouponCode();
                } else {
                    // Check user usage limit
                    UUID currentUserId = null;
                    try {
                        currentUserId = authenticationFacade.getCurrentUserId();
                    } catch (Exception ignored) {
                    }

                    boolean isLimitExceeded = false;
                    if (currentUserId != null && coupon.getUsageLimitPerUser() != null) {
                        long userUsage = userCouponRedemptionRepository.countByUserIdAndCouponId(currentUserId, coupon.getId());
                        if (userUsage >= coupon.getUsageLimitPerUser()) {
                            isLimitExceeded = true;
                            couponMessage = "Usage limit of " + coupon.getUsageLimitPerUser() + " time(s) reached for coupon " + coupon.getCouponCode();
                        }
                    }

                    if (!isLimitExceeded && coupon.getTotalUsageLimit() != null) {
                        long totalUsage = userCouponRedemptionRepository.countByCouponId(coupon.getId());
                        if (totalUsage >= coupon.getTotalUsageLimit()) {
                            isLimitExceeded = true;
                            couponMessage = "Coupon " + coupon.getCouponCode() + " overall usage limit reached";
                        }
                    }

                    // Check applicability rules if defined
                    boolean isApplicable = true;
                    List<CouponApplicabilityRule> appRules = couponApplicabilityRuleRepository.findByCouponId(coupon.getId());
                    if (!isLimitExceeded && !appRules.isEmpty()) {
                        isApplicable = appRules.stream().anyMatch(appRule -> {
                            boolean itemMatches = appRule.getItem() == null || appRule.getItem().getId().equals(item.getId());
                            boolean requestTypeMatches = appRule.getRequestType() == null || appRule.getRequestType().getId().equals(requestType.getId());
                            boolean categoryMatches = appRule.getCategory() == null || item.getCategory() != null && appRule.getCategory().getId().equals(item.getCategory().getId());
                            return itemMatches && requestTypeMatches && categoryMatches;
                        });

                        if (!isApplicable) {
                            couponMessage = "Coupon " + coupon.getCouponCode() + " is not applicable for this vehicle item or service type";
                        }
                    }

                    if (!isLimitExceeded && isApplicable) {
                        if ("FLAT".equalsIgnoreCase(coupon.getDiscountType())) {
                            discountAmount = coupon.getDiscountValue();
                        } else if ("PERCENTAGE".equalsIgnoreCase(coupon.getDiscountType())) {
                            discountAmount = subtotal.multiply(coupon.getDiscountValue())
                                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
                            if (coupon.getMaxDiscountAmount() != null && discountAmount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                                discountAmount = coupon.getMaxDiscountAmount();
                            }
                        }

                        if (discountAmount.compareTo(subtotal) > 0) {
                            discountAmount = subtotal;
                        }

                        couponApplied = true;
                        appliedCouponCode = coupon.getCouponCode();
                        couponTitle = coupon.getTitle();
                        couponMessage = "Coupon " + coupon.getCouponCode() + " applied successfully!";
                    }
                }
            } else {
                couponMessage = "Invalid or expired coupon code: " + couponCode;
            }
        }

        // 5. Calculate Taxes & Total
        BigDecimal taxableAmount = subtotal.subtract(discountAmount);
        if (taxableAmount.compareTo(BigDecimal.ZERO) < 0) {
            taxableAmount = BigDecimal.ZERO;
        }

        BigDecimal gstAmount = taxableAmount.multiply(gstPercentage)
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

        BigDecimal cgstAmount = gstAmount.divide(new BigDecimal("2"), 2, RoundingMode.HALF_UP);
        BigDecimal sgstAmount = gstAmount.subtract(cgstAmount);

        BigDecimal totalPayableAmount = taxableAmount.add(gstAmount);

        String reqCodeStr = requestType.getRequestTypeCode() != null
                ? requestType.getRequestTypeCode().name()
                : requestTypeCode != null ? requestTypeCode : "INSPECTION";

        return PricingEstimateResponse.builder()
                .itemId(item.getId())
                .itemCode(item.getItemCode())
                .itemDisplayName(item.getDisplayName())
                .requestTypeId(requestType.getId())
                .requestTypeCode(reqCodeStr)
                .requestTypeDisplayName(requestType.getDisplayName())
                .baseCharge(baseCharge)
                .convenienceFee(convenienceFee)
                .platformFee(platformFee)
                .subtotal(subtotal)
                .discountAmount(discountAmount)
                .appliedCouponCode(appliedCouponCode)
                .couponTitle(couponTitle)
                .taxableAmount(taxableAmount)
                .gstPercentage(gstPercentage)
                .gstAmount(gstAmount)
                .cgstAmount(cgstAmount)
                .sgstAmount(sgstAmount)
                .totalPayableAmount(totalPayableAmount)
                .couponApplied(couponApplied)
                .couponMessage(couponMessage)
                .build();
    }

    @Override
    @Transactional
    public OrderBillBreakdown createOrderBillSnapshot(
            UUID serviceRequestId, UUID userId, UUID itemId, Long requestTypeId, String couponCode) {

        Logger.printLog(
                LogLevel.INFO,
                LogStep.SERVICE_REQUEST,
                "Creating immutable order bill snapshot",
                "serviceRequestId=" + serviceRequestId + ", userId=" + userId + ", couponCode=" + couponCode,
                userId != null ? userId.toString() : null,
                serviceRequestId.toString()
        );

        PricingEstimateResponse estimate = calculatePricingEstimate(
                itemId, null, requestTypeId, null, couponCode
        );

        OrderBillBreakdown billBreakdown = new OrderBillBreakdown();
        billBreakdown.setServiceRequestId(serviceRequestId);
        billBreakdown.setBaseCharge(estimate.getBaseCharge());
        billBreakdown.setConvenienceFee(estimate.getConvenienceFee());
        billBreakdown.setPlatformFee(estimate.getPlatformFee());
        billBreakdown.setDiscountAmount(estimate.getDiscountAmount());
        billBreakdown.setCouponCodeApplied(estimate.getAppliedCouponCode());
        billBreakdown.setTaxableAmount(estimate.getTaxableAmount());
        billBreakdown.setGstAmount(estimate.getGstAmount());
        billBreakdown.setCgstAmount(estimate.getCgstAmount());
        billBreakdown.setSgstAmount(estimate.getSgstAmount());
        billBreakdown.setFinalPayableAmount(estimate.getTotalPayableAmount());

        Map<String, Object> jsonSnapshot = new HashMap<>();
        jsonSnapshot.put("itemCode", estimate.getItemCode());
        jsonSnapshot.put("itemDisplayName", estimate.getItemDisplayName());
        jsonSnapshot.put("requestTypeCode", estimate.getRequestTypeCode());
        jsonSnapshot.put("requestTypeDisplayName", estimate.getRequestTypeDisplayName());
        jsonSnapshot.put("gstPercentage", estimate.getGstPercentage());
        jsonSnapshot.put("couponTitle", estimate.getCouponTitle());
        jsonSnapshot.put("subtotal", estimate.getSubtotal());

        billBreakdown.setPriceBreakdownJson(jsonSnapshot);

        OrderBillBreakdown savedBreakdown = orderBillBreakdownRepository.save(billBreakdown);

        // Record Redemption if coupon was applied
        if (Boolean.TRUE.equals(estimate.getCouponApplied()) && estimate.getAppliedCouponCode() != null && userId != null) {
            couponRepository.findByCouponCodeIgnoreCaseAndIsActiveTrue(estimate.getAppliedCouponCode())
                    .ifPresent(coupon -> {
                        UserCouponRedemption redemption = new UserCouponRedemption();
                        redemption.setUserId(userId);
                        redemption.setCoupon(coupon);
                        redemption.setServiceRequestId(serviceRequestId);
                        redemption.setDiscountAppliedAmount(estimate.getDiscountAmount());
                        redemption.setUsedAt(LocalDateTime.now());
                        userCouponRedemptionRepository.save(redemption);
                    });
        }

        return savedBreakdown;
    }

    private Item resolveItem(UUID itemId, String itemCode) {
        if (itemId != null) {
            return itemRepository.findById(itemId).orElse(null);
        }
        if (itemCode != null && !itemCode.trim().isEmpty()) {
            return itemRepository.findByItemCodeAndIsActiveTrue(itemCode.trim()).orElse(null);
        }
        return itemRepository.findByItemCodeAndIsActiveTrue("BIKE").orElse(null);
    }

    private RequestType resolveRequestType(Long requestTypeId, String requestTypeCode) {
        if (requestTypeId != null) {
            return requestTypeRepository.findById(requestTypeId).orElse(null);
        }
        if (requestTypeCode != null && !requestTypeCode.trim().isEmpty()) {
            try {
                RequestTypeCode codeEnum = RequestTypeCode.valueOf(requestTypeCode.trim().toUpperCase());
                return requestTypeRepository.findByRequestTypeCode(codeEnum).orElse(null);
            } catch (Exception ignored) {
            }
        }
        return requestTypeRepository.findByRequestTypeCode(RequestTypeCode.INSPECTION).orElse(null);
    }
}
