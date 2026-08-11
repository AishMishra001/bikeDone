package com.bikedone.order_management_service.payment.enums;

public enum PaymentStatus {
    CREATED,
    PENDING,
    AUTHORIZED,
    CAPTURED,
    PAID,
    FAILED,
    REFUNDED,
    PARTIALLY_REFUNDED
}
