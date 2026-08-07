package com.bikedone.usermanagement.mechanic.repository;

import com.bikedone.usermanagement.mechanic.entity.MechanicOnboardingJourney;
import com.bikedone.usermanagement.mechanic.enums.OnboardingStepStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MechanicOnboardingJourneyRepository
        extends JpaRepository<MechanicOnboardingJourney, UUID> {

    List<MechanicOnboardingJourney> findByMechanicIdOrderByCreatedAtAsc(
            UUID mechanicId
    );

    Optional<MechanicOnboardingJourney>
    findFirstByMechanicIdAndStatusOrderByCreatedAtDesc(
            UUID mechanicId,
            OnboardingStepStatus status
    );
}