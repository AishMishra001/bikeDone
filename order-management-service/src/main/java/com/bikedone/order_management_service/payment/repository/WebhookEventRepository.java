package com.bikedone.order_management_service.payment.repository;

import com.bikedone.order_management_service.payment.entity.WebhookEvent;
import com.bikedone.order_management_service.payment.enums.PaymentProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface WebhookEventRepository extends JpaRepository<WebhookEvent, UUID> {
    Optional<WebhookEvent> findByProviderAndEventId(PaymentProvider provider, String eventId);
}
