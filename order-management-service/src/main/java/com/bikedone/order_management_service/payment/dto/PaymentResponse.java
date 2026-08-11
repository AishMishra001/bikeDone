package com.bikedone.order_management_service.payment.dto;

import com.bikedone.order_management_service.payment.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentResponse {
    private String paymentId;
    private String orderId;
    private Long amount;
    private String currency;
    private PaymentStatus status;
}
