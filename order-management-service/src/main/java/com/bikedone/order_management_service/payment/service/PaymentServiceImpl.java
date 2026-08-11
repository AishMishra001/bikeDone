package com.bikedone.order_management_service.payment.service;

import com.bikedone.order_management_service.enums.ServiceRequestStatus;
import com.bikedone.order_management_service.payment.client.RazorpayClientService;
import com.bikedone.order_management_service.payment.dto.CreatePaymentRequest;
import com.bikedone.order_management_service.payment.dto.CreatePaymentResponse;
import com.bikedone.order_management_service.payment.dto.PaymentResponse;
import com.bikedone.order_management_service.payment.dto.VerifyPaymentRequest;
import com.bikedone.order_management_service.payment.entity.Payment;
import com.bikedone.order_management_service.payment.entity.WebhookEvent;
import com.bikedone.order_management_service.payment.enums.PaymentProvider;
import com.bikedone.order_management_service.entity.ServiceRequest;
import com.bikedone.order_management_service.payment.enums.PaymentStatus;
import com.bikedone.order_management_service.payment.exception.PaymentException;
import com.bikedone.order_management_service.repository.ServiceRequestRepository;
import com.bikedone.order_management_service.security.authentication.AuthenticationFacade;
import com.bikedone.order_management_service.payment.repository.PaymentRepository;
import com.bikedone.order_management_service.payment.repository.WebhookEventRepository;
import com.razorpay.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final WebhookEventRepository webhookEventRepository;
    private final RazorpayClientService razorpayClientService;
    private final ServiceRequestRepository serviceRequestRepository;
    private final AuthenticationFacade authenticationFacade;

    @Override
    @Transactional
    public CreatePaymentResponse createPayment(CreatePaymentRequest request) {
        String customerId = authenticationFacade.getCurrentUserId().toString();

        // Here we should calculate the exact amount from the OMS order.
        // For now, mocking the amount calculation based on the request (Assuming order validation is done elsewhere)
        // Let's assume order amount is 707 (in INR), so 70700 in paise
        Long calculatedAmountInPaise = 70700L; 
        
        Order razorpayOrder = razorpayClientService.createOrder(calculatedAmountInPaise, request.getOrderId(), "INR");
        
        Payment payment = Payment.builder()
                .orderId(request.getOrderId())
                .customerId(customerId)
                .provider(PaymentProvider.RAZORPAY)
                .providerOrderId(razorpayOrder.get("id"))
                .amount(calculatedAmountInPaise/100)
                .currency("INR")
                .paymentStatus(PaymentStatus.CREATED)
                .build();
                
        paymentRepository.save(payment);
        
        return CreatePaymentResponse.builder()
                .paymentId(payment.getId().toString())
                .razorpayOrderId(razorpayOrder.get("id"))
                .razorpayKeyId(razorpayClientService.getKeyId())
                .amount(calculatedAmountInPaise)
                .currency("INR")
                .build();
    }

    @Override
    @Transactional
    public PaymentResponse verifyPayment(VerifyPaymentRequest request) {

        try {

            boolean isValid = razorpayClientService.verifySignature(
                    request.getRazorpayOrderId(),
                    request.getRazorpayPaymentId(),
                    request.getRazorpaySignature()
            );

            Payment payment = paymentRepository.findByProviderOrderId(request.getRazorpayOrderId())
                    .orElseThrow(() -> new PaymentException("Payment not found for Razorpay Order ID: " + request.getRazorpayOrderId()));

            if (!isValid) {
                payment.setPaymentStatus(PaymentStatus.FAILED);
                payment.setFailureReason("Signature verification failed");
                paymentRepository.save(payment);
                throw new PaymentException("Invalid payment signature");
            }

            payment.setProviderPaymentId(request.getRazorpayPaymentId());
            // Do not blindly mark as paid if already failed or refunded, but typically this is captured/authorized
            if (payment.getPaymentStatus() == PaymentStatus.CREATED || payment.getPaymentStatus() == PaymentStatus.PENDING) {
                payment.setPaymentStatus(PaymentStatus.AUTHORIZED);
            }
            paymentRepository.save(payment);

            serviceRequestRepository.findByRequestNumber(payment.getOrderId()).ifPresent(serviceRequest -> {
                serviceRequest.setStatus(ServiceRequestStatus.PAYMENT_CONFIRMED);
                serviceRequestRepository.save(serviceRequest);
                log.info("ServiceRequest {} status updated to PAYMENT_CONFIRMED", payment.getOrderId());
            });

            return mapToResponse(payment);
        }
        catch(Exception e){
            log.error("Error Verifying Payment Request", e);
            throw new PaymentException("Error Verifying: ", e);
        }
    }

    @Override
    public PaymentResponse getPayment(String paymentId) {
        Payment payment = paymentRepository.findById(java.util.UUID.fromString(paymentId))
                .orElseThrow(() -> new PaymentException("Payment not found with ID: " + paymentId));
        return mapToResponse(payment);
    }

    @Override
    public PaymentResponse getOrderPayment(String orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new PaymentException("Payment not found for Order ID: " + orderId));
        return mapToResponse(payment);
    }

    @Override
    @Transactional
    public void handleWebhook(String signature, String payload) {
        boolean isValid = razorpayClientService.verifyWebhookSignature(signature, payload);
        if (!isValid) {
            log.error("Invalid webhook signature");
            throw new PaymentException("Invalid webhook signature");
        }
        
        try {
            JSONObject event = new JSONObject(payload);
            String eventId = event.optString("id"); // Sometimes Razorpay event ID is passed at root
            // Some events might have a different structure, handling as root 'event'
            String eventName = event.getString("event");
            
            // Check for idempotency
            if (eventId != null && !eventId.isEmpty()) {
                if (webhookEventRepository.findByProviderAndEventId(PaymentProvider.RAZORPAY, eventId).isPresent()) {
                    log.info("Webhook event already processed: {}", eventId);
                    return; // Idempotent return
                }
                
                WebhookEvent webhookEvent = WebhookEvent.builder()
                        .eventId(eventId)
                        .provider(PaymentProvider.RAZORPAY)
                        .eventType(eventName)
                        .payload(payload)
                        .processed(true)
                        .build();
                webhookEventRepository.save(webhookEvent);
            }
            
            JSONObject payloadObj = event.getJSONObject("payload");
            
            if (eventName.equals("payment.captured")) {
                JSONObject paymentObj = payloadObj.getJSONObject("payment").getJSONObject("entity");
                String razorpayOrderId = paymentObj.getString("order_id");
                
                paymentRepository.findByProviderOrderId(razorpayOrderId).ifPresent(payment -> {
                    payment.setPaymentStatus(PaymentStatus.CAPTURED);
                    paymentRepository.save(payment);
                    serviceRequestRepository.findByRequestNumber(payment.getOrderId()).ifPresent(serviceRequest -> {
                        serviceRequest.setStatus(com.bikedone.order_management_service.enums.ServiceRequestStatus.PAYMENT_CONFIRMED);
                        serviceRequestRepository.save(serviceRequest);
                    });
                });
            } else if (eventName.equals("order.paid")) {
                JSONObject orderObj = payloadObj.getJSONObject("order").getJSONObject("entity");
                String razorpayOrderId = orderObj.getString("id");
                
                paymentRepository.findByProviderOrderId(razorpayOrderId).ifPresent(payment -> {
                    payment.setPaymentStatus(PaymentStatus.PAID);
                    paymentRepository.save(payment);
                    serviceRequestRepository.findByRequestNumber(payment.getOrderId()).ifPresent(serviceRequest -> {
                        serviceRequest.setStatus(com.bikedone.order_management_service.enums.ServiceRequestStatus.PAYMENT_CONFIRMED);
                        serviceRequestRepository.save(serviceRequest);
                    });
                });
            } else if (eventName.equals("payment.failed")) {
                JSONObject paymentObj = payloadObj.getJSONObject("payment").getJSONObject("entity");
                String razorpayOrderId = paymentObj.getString("order_id");
                
                paymentRepository.findByProviderOrderId(razorpayOrderId).ifPresent(payment -> {
                    payment.setPaymentStatus(PaymentStatus.FAILED);
                    payment.setFailureCode(paymentObj.optString("error_code"));
                    payment.setFailureReason(paymentObj.optString("error_description"));
                    paymentRepository.save(payment);
                });
            }
            
        } catch (Exception e) {
            log.error("Error processing webhook payload", e);
            throw new PaymentException("Error processing webhook payload", e);
        }
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
                .paymentId(payment.getId().toString())
                .orderId(payment.getOrderId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .status(payment.getPaymentStatus())
                .build();
    }
}
