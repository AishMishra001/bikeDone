package com.bikedone.order_management_service.payment.repository;

import com.bikedone.order_management_service.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Optional<Payment> findByProviderOrderId(String providerOrderId);
    Optional<Payment> findByOrderId(String orderId);
}
