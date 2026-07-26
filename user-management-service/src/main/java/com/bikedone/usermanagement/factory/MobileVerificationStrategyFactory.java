package com.bikedone.usermanagement.factory;

import com.bikedone.usermanagement.enums.IntegrationProvider;
import com.bikedone.usermanagement.exception.BadRequestException;
import com.bikedone.usermanagement.strategy.MobileVerificationStrategy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class MobileVerificationStrategyFactory {

    private final List<MobileVerificationStrategy> strategies;

    public MobileVerificationStrategy getStrategy(IntegrationProvider provider) {
        return strategies.stream()
                .filter(s -> s.getProvider() == provider)
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Unsupported mobile verification provider: " + provider));
    }
}
