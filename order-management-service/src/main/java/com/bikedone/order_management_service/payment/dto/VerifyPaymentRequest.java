package com.bikedone.order_management_service.payment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerifyPaymentRequest {
    @NotBlank(message = "Razorpay Order ID is mandatory")
    private String razorpayOrderId;
    
    @NotBlank(message = "Razorpay Payment ID is mandatory")
    private String razorpayPaymentId;
    
    @NotBlank(message = "Razorpay Signature is mandatory")
    private String razorpaySignature;
}
