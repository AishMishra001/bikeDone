package com.bikedone.usermanagement.mechanic.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MechanicOnboardingProgressResponse {

    private String mechanicId;
    private String currentStepCode;
    private String currentStepDisplayName;
    private Integer currentStepOrder;
    private Integer totalSteps;
    private Double progressPercentage;
    private String overallStatus; // INACTIVE, IN_PROGRESS, MANUAL_VERIFICATION, ACTIVE
    private List<StepDetail> steps;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StepDetail {
        private String stepCode;
        private String displayName;
        private Integer stepOrder;
        private Boolean isMandatory;
        private String status; // NOT_STARTED, IN_PROGRESS, COMPLETED, REJECTED
        private String remarks;
    }
}
