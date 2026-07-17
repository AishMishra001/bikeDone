package com.bikedone.usermanagement.controller;

import com.bikedone.usermanagement.common.datetime.DateTimeProvider;
import com.bikedone.usermanagement.common.response.ApiResponse;
import com.bikedone.usermanagement.dto.request.LoginRequest;
import com.bikedone.usermanagement.dto.request.SignupRequest;
import com.bikedone.usermanagement.dto.response.LoginResponse;
import com.bikedone.usermanagement.dto.response.SignupResponse;
import com.bikedone.usermanagement.security.authentication.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.bikedone.usermanagement.dto.request.RefreshTokenRequest;


@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final DateTimeProvider dateTimeProvider;

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

}