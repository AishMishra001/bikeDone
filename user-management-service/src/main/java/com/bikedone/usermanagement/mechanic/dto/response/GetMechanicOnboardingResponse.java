package com.bikedone.usermanagement.mechanic.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class GetMechanicOnboardingResponse {

    private CurrentStep currentStep;

    private List<String> completedSteps;

    private Progress progress;

    @Getter
    @Builder
    public static class CurrentStep {

        private String stepCode;

        private String displayName;

        private Integer stepOrder;
    }

    @Getter
    @Builder
    public static class Progress {

        private Integer completedSteps;

        private Integer totalSteps;

        private Integer percentage;
    }
}