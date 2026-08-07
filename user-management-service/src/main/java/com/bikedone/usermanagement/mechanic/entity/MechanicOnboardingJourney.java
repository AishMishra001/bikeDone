package com.bikedone.usermanagement.mechanic.entity;

import com.bikedone.usermanagement.entity.User;
import com.bikedone.usermanagement.mechanic.enums.OnboardingStepStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "mechanic_onboarding_journeys")
public class MechanicOnboardingJourney extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mechanic_id", nullable = false)
    private MechanicUser mechanic;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "onboarding_step_id", nullable = false)
    private MasterOnboardingStep onboardingStep;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private OnboardingStepStatus status;

    @Column(name = "remarks")
    private String remarks;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "acted_by")
    private User actedBy;
}