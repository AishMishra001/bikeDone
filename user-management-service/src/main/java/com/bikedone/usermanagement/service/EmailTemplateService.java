package com.bikedone.usermanagement.service;

public interface EmailTemplateService {

    String buildVerificationEmail(
            String name,
            String verificationUrl);

    String buildPasswordResetEmail(
            String name,
            String resetUrl,
            String token);

    String buildWelcomeEmail(
            String name);
}