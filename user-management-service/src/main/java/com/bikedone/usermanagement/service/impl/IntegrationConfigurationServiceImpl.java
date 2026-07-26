package com.bikedone.usermanagement.service.impl;

import com.bikedone.usermanagement.entity.IntegrationConfiguration;
import com.bikedone.usermanagement.enums.IntegrationProvider;
import com.bikedone.usermanagement.exception.ResourceNotFoundException;
import com.bikedone.usermanagement.repository.IntegrationConfigurationRepository;
import com.bikedone.usermanagement.service.IntegrationConfigurationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class IntegrationConfigurationServiceImpl
        implements IntegrationConfigurationService {

    private final IntegrationConfigurationRepository repository;

    @Override
    public IntegrationConfiguration getActiveConfiguration() {

        return repository.findByIsActiveTrue()
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "No active integration configuration found"));
    }
}