package com.bikedone.usermanagement.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {

    /**
     * JWT Secret Key
     */
    private String secret;

    /**
     * Access Token Expiry (milliseconds)
     */
    private Long accessTokenExpiration;

    /**
     * Refresh Token Expiry (milliseconds)
     */
    private Long refreshTokenExpiration;

}