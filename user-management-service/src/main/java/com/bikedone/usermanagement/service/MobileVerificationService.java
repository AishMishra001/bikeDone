package com.bikedone.usermanagement.service;

public interface MobileVerificationService {

    void sendOtp();

    void resendOtp();

    void verifyOtp(String otp);

}