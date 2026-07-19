package com.bikedone.usermanagement.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "email")
public class EmailProperties {

    /**
     * Brevo API Key
     */
    private String apiKey;

    /**
     * Sender Email
     */
    private String fromEmail;

    /**
     * Sender Name
     */
    private String fromName;

    /**
     * Frontend Base URL
     * Example:
     * http://localhost:3000
     * https://app.bikedone.com
     */
    private String frontendUrl;

}