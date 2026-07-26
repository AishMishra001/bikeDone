package com.bikedone.usermanagement.provider;

import com.bikedone.usermanagement.enums.IntegrationProvider;

public interface SmsProvider {

    IntegrationProvider getProvider();

    void sendOtp(String mobileNumber, String otp);

}