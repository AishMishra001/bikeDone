package com.bikedone.order_management_service.payment.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CreatePaymentResponse {
    private String paymentId;
    private String razorpayOrderId;
    private String razorpayKeyId;
    private Long amount;
    private String currency;
}
