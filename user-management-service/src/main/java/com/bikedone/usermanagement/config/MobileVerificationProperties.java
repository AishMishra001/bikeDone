package com.bikedone.usermanagement.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "security.mobile-verification.otp")
public class MobileVerificationProperties {

    private Integer length;

    private Integer expirationInMinutes;

    private Integer maxAttempts;

    private Integer resendCooldownInSeconds;

}