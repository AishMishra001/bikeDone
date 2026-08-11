package com.bikedone.order_management_service.payment.webhook;

import com.bikedone.order_management_service.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments/webhooks")
@RequiredArgsConstructor
@Slf4j
public class RazorpayWebhookController {

    private final PaymentService paymentService;

    @PostMapping("/razorpay")
    public ResponseEntity<Void> handleRazorpayWebhook(
            @RequestHeader("X-Razorpay-Signature") String signature,
            @RequestBody String payload
    ) {
        log.info("Received Razorpay webhook");
        try {
            paymentService.handleWebhook(signature, payload);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Failed to process Razorpay webhook", e);
            // Even on error, we typically return 200 to acknowledge receipt to avoid constant retries, 
            // unless it's a transient failure. For signature failure, 400 is fine.
            return ResponseEntity.badRequest().build();
        }
    }
}
