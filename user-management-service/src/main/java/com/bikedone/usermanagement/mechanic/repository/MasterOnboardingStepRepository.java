package com.bikedone.usermanagement.mechanic.repository;

import com.bikedone.usermanagement.mechanic.entity.MasterOnboardingStep;
import com.bikedone.usermanagement.mechanic.enums.OnboardingStepCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MasterOnboardingStepRepository
        extends JpaRepository<MasterOnboardingStep, UUID> {

    List<MasterOnboardingStep> findByIsActiveTrueOrderByStepOrderAsc();

    Optional<MasterOnboardingStep> findByStepCode(
            OnboardingStepCode stepCode
    );
}