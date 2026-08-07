package com.bikedone.usermanagement.mechanic.entity;

import com.bikedone.usermanagement.mechanic.enums.OnboardingStepCode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "master_onboarding_steps")
public class MasterOnboardingStep extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "step_code", nullable = false, unique = true)
    private OnboardingStepCode stepCode;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column(name = "step_order", nullable = false)
    private Integer stepOrder;

    @Column(name = "is_mandatory", nullable = false)
    private Boolean isMandatory;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;
}