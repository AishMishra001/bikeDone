package com.bikedone.usermanagement.provider;

import com.bikedone.usermanagement.enums.IntegrationProvider;
import org.springframework.stereotype.Service;

@Service
public class FirebaseSmsProvider implements SmsProvider {

    @Override
    public IntegrationProvider getProvider() {
        return IntegrationProvider.FIREBASE;
    }

    @Override
    public void sendOtp(String mobileNumber, String otp) {

        // Firebase implementation next step
    }
}