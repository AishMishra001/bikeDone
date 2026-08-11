package com.bikedone.order_management_service.payment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreatePaymentRequest {
    @NotBlank(message = "Order ID is mandatory")
    private String orderId;
}
