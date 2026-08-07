package com.bikedone.usermanagement.mechanic.mapper;

import com.bikedone.usermanagement.mechanic.dto.response.GetMechanicOnboardingResponse;
import com.bikedone.usermanagement.mechanic.entity.MasterOnboardingStep;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MechanicOnboardingMapper {

    public GetMechanicOnboardingResponse toResponse(
            MasterOnboardingStep currentStep,
            List<String> completedSteps,
            Integer totalSteps
    ) {

        int completed = completedSteps.size();

        int percentage = totalSteps == 0
                ? 0
                : (completed * 100) / totalSteps;

        return GetMechanicOnboardingResponse.builder()
                .currentStep(
                        GetMechanicOnboardingResponse.CurrentStep.builder()
                                .stepCode(currentStep.getStepCode().name())
                                .displayName(currentStep.getDisplayName())
                                .stepOrder(currentStep.getStepOrder())
                                .build()
                )
                .completedSteps(completedSteps)
                .progress(
                        GetMechanicOnboardingResponse.Progress.builder()
                                .completedSteps(completed)
                                .totalSteps(totalSteps)
                                .percentage(percentage)
                                .build()
                )
                .build();
    }
}