package com.bikedone.usermanagement.service.impl;

import com.bikedone.usermanagement.service.EmailTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
public class EmailTemplateServiceImpl
        implements EmailTemplateService {

    private final SpringTemplateEngine templateEngine;

    @Override
    public String buildVerificationEmail(
            String name,
            String verificationUrl) {

        Context context = new Context();

        context.setVariable("name", name);
        context.setVariable("verificationUrl", verificationUrl);

        return templateEngine.process(
                "emails/verify-email",
                context
        );
    }

    @Override
    public String buildPasswordResetEmail(
            String name,
            String resetUrl) {

        Context context = new Context();

        context.setVariable("name", name);
        context.setVariable("resetUrl", resetUrl);

        return templateEngine.process(
                "emails/reset-password",
                context
        );
    }

    @Override
    public String buildWelcomeEmail(String name) {

        Context context = new Context();

        context.setVariable("name", name);

        return templateEngine.process(
                "emails/welcome",
                context
        );
    }
}