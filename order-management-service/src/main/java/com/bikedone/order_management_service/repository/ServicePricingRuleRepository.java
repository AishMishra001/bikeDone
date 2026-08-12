package com.bikedone.order_management_service.repository;

import com.bikedone.order_management_service.entity.ServicePricingRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ServicePricingRuleRepository extends JpaRepository<ServicePricingRule, UUID> {
    Optional<ServicePricingRule> findByItemIdAndRequestTypeIdAndIsActiveTrue(UUID itemId, Long requestTypeId);
}
