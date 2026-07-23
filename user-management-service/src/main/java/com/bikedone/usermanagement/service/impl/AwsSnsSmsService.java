package com.bikedone.usermanagement.service.impl;

import com.bikedone.usermanagement.service.SmsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.PublishRequest;
import software.amazon.awssdk.services.sns.model.PublishResponse;

@Service
@RequiredArgsConstructor
public class AwsSnsSmsService implements SmsService {

    private final SnsClient snsClient;

    @Override
    public void sendOtp(
            String mobileNumber,
            String otp
    ) {

        String message = String.format(
                "Your Bike Done verification OTP is %s. It is valid for 5 minutes. Do not share this OTP with anyone.",
                otp
        );

        PublishRequest request = PublishRequest.builder()
                .phoneNumber(formatPhoneNumber(mobileNumber))
                .message(message)
                .build();

        PublishResponse response = snsClient.publish(request);

        System.out.println("SNS Message ID : " + response.messageId());
    }

    private String formatPhoneNumber(String mobileNumber) {

        if (mobileNumber.startsWith("+")) {
            return mobileNumber;
        }

        return "+91" + mobileNumber;
    }
}