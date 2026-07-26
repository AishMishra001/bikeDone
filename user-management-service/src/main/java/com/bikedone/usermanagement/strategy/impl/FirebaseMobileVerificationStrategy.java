package com.bikedone.usermanagement.strategy.impl;

import com.bikedone.usermanagement.common.logging.LogLevel;
import com.bikedone.usermanagement.common.logging.LogStep;
import com.bikedone.usermanagement.common.logging.Logger;
import com.bikedone.usermanagement.dto.response.MobileVerificationResponse;
import com.bikedone.usermanagement.entity.User;
import com.bikedone.usermanagement.enums.IntegrationProvider;
import com.bikedone.usermanagement.exception.BadRequestException;
import com.bikedone.usermanagement.repository.UserRepository;
import com.bikedone.usermanagement.strategy.MobileVerificationStrategy;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class FirebaseMobileVerificationStrategy implements MobileVerificationStrategy {

    private final UserRepository userRepository;
    private final Optional<FirebaseAuth> firebaseAuth;

    @Override
    public IntegrationProvider getProvider() {
        return IntegrationProvider.FIREBASE;
    }

    @Override
    public MobileVerificationResponse sendOtp(User user) {
        Logger.printLog(
                LogLevel.INFO,
                LogStep.AUTH,
                "Mobile verification requested via Firebase.",
                "Returning instruction for client to initiate Firebase Auth.",
                user.getId().toString(),
                null
        );

        return MobileVerificationResponse.builder()
                .provider(IntegrationProvider.FIREBASE)
                .clientShouldInitiateFirebase(true)
                .build();
    }

    @Override
    public void resendOtp(User user) {
        throw new BadRequestException(
                "Resend OTP must be initiated directly from mobile application when using Firebase provider."
        );
    }

    @Override
    public void verifyOtp(User user, String otp) {
        throw new BadRequestException(
                "OTP verification for Firebase provider must be performed via Firebase ID token verification."
        );
    }

    @Override
    public void verifyFirebaseToken(User user, String firebaseIdToken) {
        if (firebaseAuth.isEmpty()) {
            throw new BadRequestException("Firebase Admin SDK is not initialized. Please verify Firebase service account configuration.");
        }

        try {
            FirebaseToken decodedToken = firebaseAuth.get().verifyIdToken(firebaseIdToken);

            Logger.printLog(
                    LogLevel.INFO,
                    LogStep.AUTH,
                    "Firebase ID token verified successfully.",
                    "Firebase UID: " + decodedToken.getUid(),
                    user.getId().toString(),
                    null
            );

            user.setMobileVerified(true);
            userRepository.save(user);

            Logger.printLog(
                    LogLevel.INFO,
                    LogStep.AUTH,
                    "Mobile number verified successfully via Firebase.",
                    "User mobile verified flag updated to true.",
                    user.getId().toString(),
                    null
            );

        } catch (Exception ex) {
            Logger.printLog(
                    LogLevel.ERROR,
                    LogStep.AUTH,
                    "Firebase ID token verification failed.",
                    ex.getMessage(),
                    user.getId().toString(),
                    null
            );
            throw new BadRequestException("Invalid or expired Firebase ID Token: " + ex.getMessage());
        }
    }
}
