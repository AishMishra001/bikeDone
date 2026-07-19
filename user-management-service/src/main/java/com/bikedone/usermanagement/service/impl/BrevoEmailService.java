package com.bikedone.usermanagement.service.impl;

import com.bikedone.usermanagement.config.EmailProperties;
import com.bikedone.usermanagement.dto.request.BrevoEmailRequest;
import com.bikedone.usermanagement.dto.request.Recipient;
import com.bikedone.usermanagement.dto.request.Sender;
import com.bikedone.usermanagement.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BrevoEmailService implements EmailService {

    private static final String BREVO_SEND_EMAIL_API =
            "https://api.brevo.com/v3/smtp/email";

    private final RestClient restClient;
    private final EmailProperties emailProperties;

    @Override
    public void sendVerificationEmail(
            String to,
            String name,
            String verificationUrl) {

        String html = """
            <h2>Welcome to Bike Done</h2>

            <p>Hello %s,</p>

            <p>Click the button below to verify your email address.</p>

            <p>
                <a href="%s"
                   style="display:inline-block;
                          padding:12px 24px;
                          background:#2563eb;
                          color:#ffffff;
                          text-decoration:none;
                          border-radius:6px;">
                    Verify Email
                </a>
            </p>

            <p>This link will expire soon.</p>

            <p>If you didn't create this account, please ignore this email.</p>
            """
                .formatted(name, verificationUrl);

        sendEmail(
                to,
                name,
                "Verify your Email - Bike Done",
                html
        );
    }

    @Override
    public void sendPasswordResetEmail(
            String to,
            String name,
            String resetUrl) {

        String html = """
            <h2>Reset Your Password</h2>

            <p>Hello %s,</p>

            <p>Click the button below to reset your password.</p>

            <p>
                <a href="%s"
                   style="display:inline-block;
                          padding:12px 24px;
                          background:#dc2626;
                          color:#ffffff;
                          text-decoration:none;
                          border-radius:6px;">
                    Reset Password
                </a>
            </p>

            <p>If you didn't request a password reset, you can safely ignore this email.</p>
            """
                .formatted(name, resetUrl);

        sendEmail(
                to,
                name,
                "Reset Your Password - Bike Done",
                html
        );
    }

    // 👇 This private helper method goes here
    private void sendEmail(
            String to,
            String name,
            String subject,
            String htmlContent) {

        BrevoEmailRequest request = new BrevoEmailRequest();

        request.setSender(
                new Sender(
                        emailProperties.getFromName(),
                        emailProperties.getFromEmail()
                )
        );

        request.setTo(
                List.of(new Recipient(to, name))
        );

        request.setSubject(subject);

        request.setHtmlContent(htmlContent);

        try {

            var response = restClient.post()
                    .uri(BREVO_SEND_EMAIL_API)
                    .header("api-key", emailProperties.getApiKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .toBodilessEntity();

            log.info("Brevo Response Status: {}", response.getStatusCode());

            log.info("Email sent successfully to {}", to);

        } catch (Exception ex) {

            log.error("Failed to send email to {}", to, ex);

            throw new RuntimeException("Unable to send email.");

        }

    }
}