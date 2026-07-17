package com.bikedone.usermanagement.security.authentication;

import com.bikedone.usermanagement.dto.request.LoginRequest;
import com.bikedone.usermanagement.dto.request.RefreshTokenRequest;
import com.bikedone.usermanagement.dto.request.SignupRequest;
import com.bikedone.usermanagement.dto.response.LoginResponse;
import com.bikedone.usermanagement.dto.response.SignupResponse;

public interface AuthService {

    SignupResponse signup(SignupRequest request);
    LoginResponse login(LoginRequest request);
    LoginResponse refresh(RefreshTokenRequest request);
}