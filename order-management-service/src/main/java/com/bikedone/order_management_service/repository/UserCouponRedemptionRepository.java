package com.bikedone.order_management_service.repository;

import com.bikedone.order_management_service.entity.UserCouponRedemption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface UserCouponRedemptionRepository extends JpaRepository<UserCouponRedemption, UUID> {
    long countByUserIdAndCouponId(UUID userId, UUID couponId);
    long countByCouponId(UUID couponId);
}
