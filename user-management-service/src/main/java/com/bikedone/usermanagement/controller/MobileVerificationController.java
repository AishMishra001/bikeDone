package com.bikedone.usermanagement.controller;

import com.bikedone.usermanagement.common.datetime.DateTimeProvider;
import com.bikedone.usermanagement.common.response.ApiResponse;
import com.bikedone.usermanagement.dto.request.VerifyFirebaseTokenRequest;
import com.bikedone.usermanagement.dto.request.VerifyMobileOtpRequest;
import com.bikedone.usermanagement.dto.response.MobileVerificationResponse;
import com.bikedone.usermanagement.service.MobileVerificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/mobile-verification")
public class MobileVerificationController {

    private final MobileVerificationService mobileVerificationService;
    private final DateTimeProvider dateTimeProvider;

    @PostMapping("/send-otp")
    public ApiResponse<MobileVerificationResponse> sendOtp() {
        MobileVerificationResponse response = mobileVerificationService.sendOtp();

        return ApiResponse.<MobileVerificationResponse>builder()
                .success(true)
                .message("Mobile verification initiated successfully.")
                .data(response)
                .timestamp(dateTimeProvider.now())
                .build();
    }

    @PostMapping("/resend-otp")
    public ApiResponse<Void> resendOtp() {
        mobileVerificationService.resendOtp();

        return ApiResponse.<Void>builder()
                .success(true)
                .message("OTP resent successfully.")
                .timestamp(dateTimeProvider.now())
                .build();
    }

    @PostMapping("/verify-otp")
    public ApiResponse<Void> verifyOtp(
            @Valid @RequestBody VerifyMobileOtpRequest request
    ) {
        mobileVerificationService.verifyOtp(request.getOtp());

        return ApiResponse.<Void>builder()
                .success(true)
                .message("Mobile number verified successfully.")
                .timestamp(dateTimeProvider.now())
                .build();
    }

    @PostMapping("/verify-firebase-token")
    public ApiResponse<Void> verifyFirebaseToken(
            @Valid @RequestBody VerifyFirebaseTokenRequest request
    ) {
        mobileVerificationService.verifyFirebaseToken(request.getFirebaseIdToken());

        return ApiResponse.<Void>builder()
                .success(true)
                .message("Mobile number verified successfully via Firebase.")
                .timestamp(dateTimeProvider.now())
                .build();
    }
}