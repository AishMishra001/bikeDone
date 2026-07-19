package com.bikedone.usermanagement.service;

public interface EmailService {

    void sendVerificationEmail(
            String to,
            String name,
            String verificationUrl);

    void sendPasswordResetEmail(
            String to,
            String name,
            String resetUrl);

}