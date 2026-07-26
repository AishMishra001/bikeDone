package com.bikedone.usermanagement.util;

import com.bikedone.usermanagement.config.MobileVerificationProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
@RequiredArgsConstructor
public class OtpGenerator {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final MobileVerificationProperties properties;

    public String generateOtp() {

        int length = properties.getLength();

        StringBuilder otp = new StringBuilder(length);

        for (int i = 0; i < length; i++) {
            otp.append(SECURE_RANDOM.nextInt(10));
        }

        return otp.toString();
    }

}