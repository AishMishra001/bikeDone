package com.bikedone.usermanagement.service;

public interface SmsService {

    void sendOtp(String mobileNumber, String otp);

}