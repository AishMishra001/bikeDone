package com.bikedone.usermanagement.provider;

import com.bikedone.usermanagement.enums.IntegrationProvider;
import com.bikedone.usermanagement.service.impl.AwsSnsSmsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AwsSmsProvider implements SmsProvider {

    private final AwsSnsSmsService awsSnsSmsService;

    @Override
    public IntegrationProvider getProvider() {
        return IntegrationProvider.AWS_SNS;
    }

    @Override
    public void sendOtp(String mobileNumber, String otp) {
        awsSnsSmsService.sendOtp(mobileNumber, otp);
    }
}