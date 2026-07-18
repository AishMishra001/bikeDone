package com.bikedone.usermanagement.service;

public interface EmailVerificationService {

    void sendVerificationEmail();

    void verifyEmail(String token);

}