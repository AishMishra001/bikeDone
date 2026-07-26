package com.bikedone.usermanagement.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "firebase")
public class FirebaseProperties {

    /**
     * Firebase Service Account JSON file path
     */
    private String serviceAccountPath;

}