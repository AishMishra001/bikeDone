package com.bikedone.usermanagement.service;

import com.bikedone.usermanagement.dto.request.ResendEmailVerificationRequest;
import com.bikedone.usermanagement.entity.User;

public interface EmailVerificationService {

    void sendVerificationEmail();

    void verifyEmail(String token);

    void sendVerificationEmail(User user);

    void resendVerificationEmail(ResendEmailVerificationRequest request);

}