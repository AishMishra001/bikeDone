package com.bikedone.order_management_service.repository;

import com.bikedone.order_management_service.entity.CouponApplicabilityRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CouponApplicabilityRuleRepository extends JpaRepository<CouponApplicabilityRule, UUID> {
    List<CouponApplicabilityRule> findByCouponId(UUID couponId);
}
