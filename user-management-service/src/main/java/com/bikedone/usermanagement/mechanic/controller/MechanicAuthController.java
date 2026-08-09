package com.bikedone.usermanagement.mechanic.controller;

import com.bikedone.usermanagement.common.datetime.DateTimeProvider;
import com.bikedone.usermanagement.common.response.ApiResponse;
import com.bikedone.usermanagement.dto.request.RefreshTokenRequest;
import com.bikedone.usermanagement.dto.response.MobileVerificationResponse;
import com.bikedone.usermanagement.mechanic.dto.request.SendMechanicOtpRequest;
import com.bikedone.usermanagement.mechanic.dto.request.VerifyMechanicFirebaseTokenRequest;
import com.bikedone.usermanagement.mechanic.dto.request.VerifyMechanicOtpRequest;
import com.bikedone.usermanagement.mechanic.dto.response.MechanicLoginResponse;
import com.bikedone.usermanagement.mechanic.service.MechanicAuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
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
        MechanicLoginResponse loginResponse = mechanicAuthService.verifyFirebaseToken(request.getMobileNumber(), request.getFirebaseIdToken());
        if (loginResponse.getRefreshToken() != null) {
            addRefreshTokenCookie(response, loginResponse.getRefreshToken());
        }

        return ApiResponse.<MechanicLoginResponse>builder()
                .success(true)
                .message("Mechanic Firebase login successful.")
                .data(loginResponse)
                .timestamp(dateTimeProvider.now())
                .build();
    }

    @PostMapping("/refresh")
    public ApiResponse<MechanicLoginResponse> refresh(
            @Valid @RequestBody(required = false) RefreshTokenRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse response) {

        String cookieToken = extractRefreshTokenCookie(httpRequest);
        String requestToken = request != null ? request.getRefreshToken() : null;

        MechanicLoginResponse loginResponse = mechanicAuthService.refresh(requestToken, cookieToken);
        if (loginResponse.getRefreshToken() != null) {
            addRefreshTokenCookie(response, loginResponse.getRefreshToken());
        }

        return ApiResponse.<MechanicLoginResponse>builder()
                .success(true)
                .message("Token refreshed successfully.")
                .data(loginResponse)
                .timestamp(dateTimeProvider.now())
                .build();
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(
            @RequestBody(required = false) RefreshTokenRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse response) {

        String cookieToken = extractRefreshTokenCookie(httpRequest);
        String requestToken = request != null ? request.getRefreshToken() : null;

        mechanicAuthService.logout(requestToken, cookieToken);
        clearRefreshTokenCookie(response);

        return ApiResponse.<Void>builder()
                .success(true)
                .message("Logged out successfully.")
                .timestamp(dateTimeProvider.now())
                .build();
    }

    private void addRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        Cookie cookie = new Cookie("refresh_token", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(30 * 24 * 60 * 60); // 30 days
        response.addCookie(cookie);
    }

    private String extractRefreshTokenCookie(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("refresh_token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    private void clearRefreshTokenCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie("refresh_token", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }
}
