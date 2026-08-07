package com.bikedone.usermanagement.service.impl;

import com.bikedone.usermanagement.common.logging.LogLevel;
import com.bikedone.usermanagement.common.logging.LogStep;
import com.bikedone.usermanagement.common.logging.Logger;
import com.bikedone.usermanagement.dto.response.MobileVerificationResponse;
import com.bikedone.usermanagement.entity.User;
import com.bikedone.usermanagement.enums.IntegrationProvider;
import com.bikedone.usermanagement.exception.BadRequestException;
import com.bikedone.usermanagement.factory.MobileVerificationStrategyFactory;
import com.bikedone.usermanagement.repository.UserRepository;
import com.bikedone.usermanagement.security.authentication.AuthenticationFacade;
import com.bikedone.usermanagement.security.user.UserPrincipal;
import com.bikedone.usermanagement.service.IntegrationConfigurationService;
import com.bikedone.usermanagement.service.MobileVerificationService;
import com.bikedone.usermanagement.strategy.MobileVerificationStrategy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MobileVerificationServiceImpl implements MobileVerificationService {

    private final AuthenticationFacade authenticationFacade;
    private final UserRepository userRepository;
    private final IntegrationConfigurationService integrationConfigurationService;
    private final MobileVerificationStrategyFactory strategyFactory;

    @Override
    @Transactional
    public MobileVerificationResponse sendOtp() {
        User user = getAuthenticatedAndEligibleUser("Mobile verification OTP requested.");
        MobileVerificationStrategy strategy = getActiveStrategy();
        return strategy.sendOtp(user);
    }

    @Override
    @Transactional
    public void resendOtp() {
        User user = getAuthenticatedAndEligibleUser("Mobile verification OTP resend requested.");
        MobileVerificationStrategy strategy = getActiveStrategy();
        strategy.resendOtp(user);
    }

    @Override
    @Transactional
    public void verifyOtp(String otp) {
        User user = getAuthenticatedAndEligibleUser("Mobile verification OTP verification requested.");
        MobileVerificationStrategy strategy = getActiveStrategy();
        strategy.verifyOtp(user, otp);
    }

    @Override
    @Transactional
    public void verifyFirebaseToken(String firebaseIdToken) {
        User user = getAuthenticatedAndEligibleUser("Mobile verification via Firebase token requested.");
        MobileVerificationStrategy strategy = getActiveStrategy();
        strategy.verifyFirebaseToken(user, firebaseIdToken);
    }

    private User getAuthenticatedAndEligibleUser(String logActionMessage) {
        UserPrincipal principal = authenticationFacade.getCurrentUser();

        User user = userRepository.findUserWithRoleByEmail(principal.getUsername())
                .orElseThrow(() -> new BadRequestException("User not found."));

        Logger.printLog(
                LogLevel.INFO,
                LogStep.AUTH,
                logActionMessage,
                "User: " + user.getEmail(),
                user.getId().toString(),
                null
        );

        validateMobileVerificationEligibility(user);

        return user;
    }

    private MobileVerificationStrategy getActiveStrategy() {
        IntegrationProvider activeProvider = integrationConfigurationService
                .getActiveConfiguration()
                .getProvider();

        return strategyFactory.getStrategy(activeProvider);
    }

    private void validateMobileVerificationEligibility(User user) {
        if (Boolean.TRUE.equals(user.getMobileVerified())) {
            Logger.printLog(
                    LogLevel.WARN,
                    LogStep.AUTH,
                    "Mobile verification skipped.",
                    "Mobile number is already verified.",
                    user.getId().toString(),
                    null
            );

            throw new BadRequestException("Mobile number is already verified.");
        }

        if (user.getMobileNumber() == null || user.getMobileNumber().isBlank()) {
            throw new BadRequestException("Mobile number is not available.");
        }
    }
}
