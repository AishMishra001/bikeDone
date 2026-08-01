package com.bikedone.usermanagement.service.impl;

import com.bikedone.usermanagement.common.logging.LogLevel;
import com.bikedone.usermanagement.common.logging.LogStep;
import com.bikedone.usermanagement.common.logging.Logger;
import com.bikedone.usermanagement.service.SmsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.PublishRequest;
import software.amazon.awssdk.services.sns.model.PublishResponse;

@Service
@RequiredArgsConstructor
public class AwsSnsSmsService {

    private final SnsClient snsClient;

    public void sendOtp(String mobileNumber, String otp) {

        Logger.printLog(
                LogLevel.INFO,
                LogStep.AUTH,
                "Mobile verification OTP generated.",
                "Mobile: " + mobileNumber + " | OTP: " + otp,
                null,
                null
        );

        String message = String.format(
                "Your Bike Done verification OTP is %s. It is valid for 5 minutes. Do not share this OTP with anyone.",
                otp
        );

        PublishRequest request = PublishRequest.builder()
                .phoneNumber(formatPhoneNumber(mobileNumber))
                .message(message)
                .build();

        try {
            PublishResponse response = snsClient.publish(request);

            Logger.printLog(
                    LogLevel.INFO,
                    LogStep.AUTH,
                    "AWS SNS SMS published successfully.",
                    "SNS Message ID: " + response.messageId(),
                    null,
                    null
            );
        } catch (Exception ex) {
            Logger.printLog(
                    LogLevel.WARN,
                    LogStep.AUTH,
                    "AWS SNS SMS publish skipped or failed in local environment.",
                    ex.getMessage(),
                    null,
                    null
            );
        }
    }

    private String formatPhoneNumber(String mobileNumber) {

        if (mobileNumber.startsWith("+")) {
            return mobileNumber;
        }

        return "+91" + mobileNumber;
    }
}