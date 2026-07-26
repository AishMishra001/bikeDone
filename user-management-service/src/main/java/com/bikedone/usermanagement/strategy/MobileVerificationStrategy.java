package com.bikedone.usermanagement.strategy;

import com.bikedone.usermanagement.dto.response.MobileVerificationResponse;
import com.bikedone.usermanagement.entity.User;
import com.bikedone.usermanagement.enums.IntegrationProvider;

public interface MobileVerificationStrategy {

    IntegrationProvider getProvider();

    MobileVerificationResponse sendOtp(User user);

    void resendOtp(User user);

    void verifyOtp(User user, String otp);

    void verifyFirebaseToken(User user, String firebaseIdToken);

}
