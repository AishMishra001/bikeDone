package com.bikedone.usermanagement.mechanic.controller;

import com.bikedone.usermanagement.common.datetime.DateTimeProvider;
import com.bikedone.usermanagement.common.response.ApiResponse;
import com.bikedone.usermanagement.dto.response.MobileVerificationResponse;
import com.bikedone.usermanagement.mechanic.dto.request.SendMechanicOtpRequest;
import com.bikedone.usermanagement.mechanic.dto.request.VerifyMechanicFirebaseTokenRequest;
import com.bikedone.usermanagement.mechanic.dto.request.VerifyMechanicOtpRequest;
import com.bikedone.usermanagement.mechanic.dto.response.MechanicLoginResponse;
import com.bikedone.usermanagement.mechanic.service.MechanicAuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth/mechanic")
@RequiredArgsConstructor
public class MechanicAuthController {

    private final MechanicAuthService mechanicAuthService;
    private final DateTimeProvider dateTimeProvider;

    @PostMapping("/send-otp")
    public ApiResponse<MobileVerificationResponse> sendOtp(
            @Valid @RequestBody SendMechanicOtpRequest request
    ) {
        MobileVerificationResponse response = mechanicAuthService.sendOtp(request);

        return ApiResponse.<MobileVerificationResponse>builder()
                .success(true)
                .message("OTP sent successfully to mobile number.")
                .data(response)
                .timestamp(dateTimeProvider.now())
                .build();
    }

    @PostMapping("/verify-otp")
    public ApiResponse<MechanicLoginResponse> verifyOtp(
            @Valid @RequestBody VerifyMechanicOtpRequest request,
            HttpServletResponse response
    ) {
        MechanicLoginResponse loginResponse = mechanicAuthService.verifyOtp(request);
        if (loginResponse.getRefreshToken() != null) {
            addRefreshTokenCookie(response, loginResponse.getRefreshToken());
        }

        return ApiResponse.<MechanicLoginResponse>builder()
                .success(true)
                .message("Mechanic login successful.")
                .data(loginResponse)
                .timestamp(dateTimeProvider.now())
                .build();
    }

    @PostMapping("/verify-firebase-token")
    public ApiResponse<MechanicLoginResponse> verifyFirebaseToken(
            @Valid @RequestBody VerifyMechanicFirebaseTokenRequest request,
            HttpServletResponse response
    ) {
        MechanicLoginResponse loginResponse = mechanicAuthService.verifyFirebaseToken(
                request.getMobileNumber(),
                request.getFirebaseIdToken()
        );
        if (loginResponse.getRefreshToken() != null) {
            addRefreshTokenCookie(response, loginResponse.getRefreshToken());
        }

        return ApiResponse.<MechanicLoginResponse>builder()
                .success(true)
                .message("Mechanic login successful via Firebase.")
                .data(loginResponse)
                .timestamp(dateTimeProvider.now())
                .build();
    }

    private void addRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return;
        }

        Cookie cookie = new Cookie("refresh_token", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(7 * 24 * 60 * 60);
        cookie.setAttribute("SameSite", "Lax");
        response.addCookie(cookie);
    }
}
