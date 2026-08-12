package com.bikedone.order_management_service.repository;

import com.bikedone.order_management_service.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, UUID> {
    Optional<Coupon> findByCouponCodeIgnoreCaseAndIsActiveTrue(String couponCode);
}
