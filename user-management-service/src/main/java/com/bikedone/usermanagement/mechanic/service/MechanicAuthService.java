package com.bikedone.usermanagement.mechanic.service;

import com.bikedone.usermanagement.dto.response.MobileVerificationResponse;
import com.bikedone.usermanagement.mechanic.dto.request.SendMechanicOtpRequest;
import com.bikedone.usermanagement.mechanic.dto.request.VerifyMechanicOtpRequest;
import com.bikedone.usermanagement.mechanic.dto.response.MechanicLoginResponse;

public interface MechanicAuthService {

    MobileVerificationResponse sendOtp(SendMechanicOtpRequest request);

    MechanicLoginResponse verifyOtp(VerifyMechanicOtpRequest request);

    MechanicLoginResponse verifyFirebaseToken(String mobileNumber, String firebaseIdToken);

    MechanicLoginResponse refresh(String requestToken, String cookieToken);

    void logout(String requestToken, String cookieToken);
}
