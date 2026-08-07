package com.bikedone.usermanagement.controller;

import com.bikedone.usermanagement.common.datetime.DateTimeProvider;
import com.bikedone.usermanagement.common.response.ApiResponse;
import com.bikedone.usermanagement.dto.request.ForgotPasswordRequest;
import com.bikedone.usermanagement.dto.request.LoginRequest;
import com.bikedone.usermanagement.dto.request.LogoutRequest;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import com.bikedone.usermanagement.dto.request.ResendEmailVerificationRequest;
import com.bikedone.usermanagement.dto.request.ResetPasswordRequest;
import com.bikedone.usermanagement.dto.request.SignupRequest;
import com.bikedone.usermanagement.dto.response.LoginResponse;
import com.bikedone.usermanagement.dto.response.SignupResponse;
import com.bikedone.usermanagement.security.authentication.AuthService;
import com.bikedone.usermanagement.service.EmailVerificationService;
import com.bikedone.usermanagement.service.PasswordResetService;
import com.bikedone.usermanagement.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.bikedone.usermanagement.dto.request.RefreshTokenRequest;


@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final DateTimeProvider dateTimeProvider;
    private final EmailVerificationService emailVerificationService;
    private final PasswordResetService passwordResetService;


    @PostMapping("/signup")
    public ApiResponse<SignupResponse> signup(@Valid @RequestBody SignupRequest request) {

        SignupResponse response = authService.signup(request);

        return ApiResponse.<SignupResponse>builder()
                .success(true)
                .message("Registration successful. Please verify your email before logging in.")
                .data(response)
                .timestamp(dateTimeProvider.now())
                .build();

    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {

        LoginResponse loginResponse = authService.login(request);
        addRefreshTokenCookie(response, loginResponse.getRefreshToken());

        return ApiResponse.<LoginResponse>builder()
                .success(true)
                .message("Login successful.")
                .data(loginResponse)
                .timestamp(dateTimeProvider.now())
                .build();
    }

    @PostMapping("/refresh")
    public ApiResponse<LoginResponse> refresh(
            @Valid @RequestBody(required = false) RefreshTokenRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse response) {

        String cookieToken = extractRefreshTokenCookie(httpRequest);
        String requestToken = request != null ? request.getRefreshToken() : null;

        LoginResponse loginResponse = authService.refresh(requestToken, cookieToken);
        addRefreshTokenCookie(response, loginResponse.getRefreshToken());

        return ApiResponse.<LoginResponse>builder()
                .success(true)
                .message("Token refreshed successfully.")
                .data(loginResponse)
                .timestamp(dateTimeProvider.now())
                .build();
    }

    @PostMapping("/send-email-verification")
    public ApiResponse<Void> sendEmailVerification() {

        emailVerificationService.sendVerificationEmail();

        return ApiResponse.<Void>builder()
                .success(true)
                .message("Verification email sent successfully.")
                .timestamp(dateTimeProvider.now())
                .build();
    }

    @PostMapping("/resend-email-verification")
    public ApiResponse<Void> resendEmailVerification(
            @Valid @RequestBody ResendEmailVerificationRequest request) {

        emailVerificationService.resendVerificationEmail(request);

        return ApiResponse.<Void>builder()
                .success(true)
                .message("Verification email sent successfully.")
                .timestamp(dateTimeProvider.now())
                .build();
    }

    @GetMapping("/verify-email")
    public ApiResponse<Void> verifyEmail(
            @RequestParam String token) {

        emailVerificationService.verifyEmail(token);

        return ApiResponse.<Void>builder()
                .success(true)
                .message("Email verified successfully.")
                .timestamp(dateTimeProvider.now())
                .build();
    }

    @PostMapping("/forgot-password")
    public ApiResponse<Void> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        passwordResetService.forgotPassword(request.getEmail());

        return ApiResponse.<Void>builder()
                .success(true)
                .message("If an account exists with this email, a password reset link has been sent.")
                .timestamp(dateTimeProvider.now())
                .build();
    }

    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        passwordResetService.resetPassword(request);

        return ApiResponse.<Void>builder()
                .success(true)
                .message("Password reset successfully.")
                .timestamp(dateTimeProvider.now())
                .build();
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(
            @Valid @RequestBody(required = false) LogoutRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse response) {

        String cookieToken = extractRefreshTokenCookie(httpRequest);
        String requestToken = request != null ? request.getRefreshToken() : null;

        authService.logout(requestToken, cookieToken);
        clearRefreshTokenCookie(response);

        return ApiResponse.<Void>builder()
                .success(true)
                .message("Logged out successfully.")
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

    private void clearRefreshTokenCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie("refresh_token", "");
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        cookie.setAttribute("SameSite", "Lax");
        response.addCookie(cookie);
    }

    private String extractRefreshTokenCookie(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }

        for (Cookie cookie : request.getCookies()) {
            if ("refresh_token".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }

        return null;
    }

}