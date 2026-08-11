package com.bikedone.order_management_service.payment.service;

import com.bikedone.order_management_service.payment.dto.CreatePaymentRequest;
import com.bikedone.order_management_service.payment.dto.CreatePaymentResponse;
import com.bikedone.order_management_service.payment.dto.PaymentResponse;
import com.bikedone.order_management_service.payment.dto.VerifyPaymentRequest;

public interface PaymentService {
    CreatePaymentResponse createPayment(CreatePaymentRequest request);
    PaymentResponse verifyPayment(VerifyPaymentRequest request);
    PaymentResponse getPayment(String paymentId);
    PaymentResponse getOrderPayment(String orderId);
    void handleWebhook(String signature, String payload);
}
