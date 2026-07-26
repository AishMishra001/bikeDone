package com.bikedone.usermanagement.service.impl;

import com.bikedone.usermanagement.factory.SmsProviderFactory;
import com.bikedone.usermanagement.service.SmsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SmsServiceImpl implements SmsService {

    private final SmsProviderFactory smsProviderFactory;

    @Override
    public void sendOtp(String mobileNumber, String otp) {

        smsProviderFactory
                .getProvider()
                .sendOtp(mobileNumber, otp);
    }
}