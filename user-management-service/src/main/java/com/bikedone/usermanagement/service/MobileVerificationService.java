package com.bikedone.usermanagement.service;

import com.bikedone.usermanagement.dto.response.MobileVerificationResponse;

public interface MobileVerificationService {

    MobileVerificationResponse sendOtp();

    void resendOtp();

    void verifyOtp(String otp);

    void verifyFirebaseToken(String firebaseIdToken);

}