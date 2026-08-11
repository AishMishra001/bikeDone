package com.bikedone.order_management_service.payment.controller;

import com.bikedone.order_management_service.payment.dto.CreatePaymentRequest;
import com.bikedone.order_management_service.payment.dto.CreatePaymentResponse;
import com.bikedone.order_management_service.payment.dto.PaymentResponse;
import com.bikedone.order_management_service.payment.dto.VerifyPaymentRequest;
import com.bikedone.order_management_service.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<CreatePaymentResponse> createPayment(@Valid @RequestBody CreatePaymentRequest request) {
        return ResponseEntity.ok(paymentService.createPayment(request));
    }

    @PostMapping("/verify")
    public ResponseEntity<PaymentResponse> verifyPayment(@Valid @RequestBody VerifyPaymentRequest request) {
        return ResponseEntity.ok(paymentService.verifyPayment(request));
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<PaymentResponse> getPayment(@PathVariable String paymentId) {
        return ResponseEntity.ok(paymentService.getPayment(paymentId));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentResponse> getOrderPayment(@PathVariable String orderId) {
        return ResponseEntity.ok(paymentService.getOrderPayment(orderId));
    }
}
