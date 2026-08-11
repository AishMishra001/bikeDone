package com.bikedone.order_management_service.payment.client;

import com.bikedone.order_management_service.payment.exception.PaymentException;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class RazorpayClientService {

    private final RazorpayClient razorpayClient;

    @Value("${razorpay.key-id}")
    private String keyId;

    @Value("${razorpay.key-secret}")
    private String keySecret;

    @Value("${razorpay.webhook-secret}")
    private String webhookSecret;

    public Order createOrder(Long amountInPaise, String receipt, String currency) {
        try {
            JSONObject request = new JSONObject();
            request.put("amount", amountInPaise);
            request.put("currency", currency);
            request.put("receipt", receipt);

            return razorpayClient.orders.create(request);
        } catch (Exception e) {
            log.error("Failed to create Razorpay order", e);
            throw new PaymentException("Failed to create Razorpay order: " + e.getMessage(), e);
        }
    }

    public boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", orderId);
            options.put("razorpay_payment_id", paymentId);
            options.put("razorpay_signature", signature);

            return Utils.verifyPaymentSignature(options, keySecret);
        } catch (Exception e) {
            log.error("Failed to verify Razorpay signature", e);
            return false;
        }
    }

    public boolean verifyWebhookSignature(String signature, String payload) {
        try {
            return Utils.verifyWebhookSignature(payload, signature, webhookSecret);
        } catch (Exception e) {
            log.error("Failed to verify webhook signature", e);
            return false;
        }
    }

    public String getKeyId() {
        return keyId;
    }
}
