package com.bikedone.usermanagement.controller;

import com.bikedone.usermanagement.common.datetime.DateTimeProvider;
import com.bikedone.usermanagement.common.response.ApiResponse;
import com.bikedone.usermanagement.dto.request.ForgotPasswordRequest;
import com.bikedone.usermanagement.dto.request.LoginRequest;
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
                .message("Customer registered successfully.")
                .data(response)
                .timestamp(dateTimeProvider.now())
                .build();

    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        LoginResponse response = authService.login(request);

        return ApiResponse.<LoginResponse>builder()
                .success(true)
                .message("Login successful.")
                .data(response)
                .timestamp(dateTimeProvider.now())
                .build();
    }

    @PostMapping("/refresh")
    public ApiResponse<LoginResponse> refresh(
            @Valid @RequestBody RefreshTokenRequest request) {

        LoginResponse response = authService.refresh(request);

        return ApiResponse.<LoginResponse>builder()
                .success(true)
                .message("Token refreshed successfully.")
                .data(response)
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

}