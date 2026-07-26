package com.bikedone.usermanagement.service;

import com.bikedone.usermanagement.entity.IntegrationConfiguration;
import com.bikedone.usermanagement.enums.IntegrationProvider;

public interface IntegrationConfigurationService {

    IntegrationConfiguration getActiveConfiguration();

}