package com.bikedone.usermanagement.factory;

import com.bikedone.usermanagement.enums.IntegrationProvider;
import com.bikedone.usermanagement.provider.SmsProvider;
import com.bikedone.usermanagement.service.IntegrationConfigurationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class SmsProviderFactory {

    private final List<SmsProvider> providers;
    private final IntegrationConfigurationService configurationService;

    public SmsProvider getProvider() {

        IntegrationProvider provider = configurationService
                .getActiveConfiguration()
                .getProvider();

        return providers.stream()
                .filter(p -> p.getProvider() == provider)
                .findFirst()
                .orElseThrow(() ->
                        new IllegalStateException(
                                "No SMS provider found for " + provider
                        ));
    }
}