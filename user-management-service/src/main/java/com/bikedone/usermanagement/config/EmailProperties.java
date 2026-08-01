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

    /**
     * Constructs a full URL using frontendUrl and the given relative path.
     */
    public String buildUrl(String path) {
        if (frontendUrl == null || frontendUrl.isEmpty()) {
            return path;
        }
        String base = frontendUrl.trim();
        String cleanPath = (path != null && path.startsWith("/")) ? path.substring(1) : (path != null ? path : "");
        if (base.endsWith("/")) {
            return base + cleanPath;
        } else {
            return base + "/" + cleanPath;
        }
    }
}