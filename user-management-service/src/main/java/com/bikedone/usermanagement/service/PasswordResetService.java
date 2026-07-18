package com.bikedone.usermanagement.service;

import com.bikedone.usermanagement.dto.request.ResetPasswordRequest;

public interface PasswordResetService {

    void forgotPassword(String email);

    void resetPassword(ResetPasswordRequest request);

}