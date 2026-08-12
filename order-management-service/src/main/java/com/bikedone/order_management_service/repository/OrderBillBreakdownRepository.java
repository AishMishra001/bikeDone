package com.bikedone.order_management_service.repository;

import com.bikedone.order_management_service.entity.OrderBillBreakdown;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderBillBreakdownRepository extends JpaRepository<OrderBillBreakdown, UUID> {
    Optional<OrderBillBreakdown> findByServiceRequestId(UUID serviceRequestId);
}
