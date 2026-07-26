package com.bikedone.usermanagement.repository;

import com.bikedone.usermanagement.entity.IntegrationConfiguration;
import com.bikedone.usermanagement.enums.IntegrationProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface IntegrationConfigurationRepository
        extends JpaRepository<IntegrationConfiguration, UUID> {

    Optional<IntegrationConfiguration> findByIsActiveTrue();

}