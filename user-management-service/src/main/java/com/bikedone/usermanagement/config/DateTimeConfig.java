package com.bikedone.usermanagement.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;
import java.time.ZoneId;

@Configuration
public class DateTimeConfig {

    /**
     * Application Clock
     * All date/time operations should use this bean
     * to ensure consistent IST timezone across the application.
     */
    @Bean
    public Clock appClock() {
        return Clock.system(ZoneId.of("Asia/Kolkata"));
    }

}