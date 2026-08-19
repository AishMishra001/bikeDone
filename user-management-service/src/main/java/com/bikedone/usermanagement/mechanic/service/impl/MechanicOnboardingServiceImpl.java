package com.bikedone.usermanagement.mechanic.service.impl;

import com.bikedone.usermanagement.enums.UserStatus;
import com.bikedone.usermanagement.exception.BadRequestException;
import com.bikedone.usermanagement.exception.ResourceNotFoundException;
import com.bikedone.usermanagement.mechanic.dto.request.*;
import com.bikedone.usermanagement.mechanic.dto.response.MechanicOnboardingProgressResponse;
import com.bikedone.usermanagement.mechanic.entity.*;
import com.bikedone.usermanagement.mechanic.enums.OnboardingStepCode;
import com.bikedone.usermanagement.mechanic.enums.OnboardingStepStatus;
import com.bikedone.usermanagement.mechanic.repository.*;
import com.bikedone.usermanagement.mechanic.service.MechanicOnboardingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MechanicOnboardingServiceImpl implements MechanicOnboardingService {

    private final MasterOnboardingStepRepository masterOnboardingStepRepository;
    private final MechanicOnboardingJourneyRepository journeyRepository;
    private final MechanicUserRepository mechanicUserRepository;
    private final MechanicProfileRepository profileRepository;
    private final MechanicServiceRepository serviceRepository;
    private final MechanicDocumentRepository documentRepository;
    private final MechanicBankDetailRepository bankDetailRepository;

    @Override
    @Transactional(readOnly = true)
    public MechanicOnboardingProgressResponse getOnboardingProgress(MechanicUser mechanic) {
        List<MasterOnboardingStep> masterSteps = masterOnboardingStepRepository.findByIsActiveTrueOrderByStepOrderAsc();
        List<MechanicOnboardingJourney> journeys = journeyRepository.findByMechanicIdOrderByCreatedAtAsc(mechanic.getId());

        Map<OnboardingStepCode, MechanicOnboardingJourney> journeyMap = journeys.stream()
                .collect(Collectors.toMap(
                        j -> j.getOnboardingStep().getStepCode(),
                        j -> j,
                        (existing, replacement) -> replacement
                ));

        List<MechanicOnboardingProgressResponse.StepDetail> stepDetails = new ArrayList<>();
        MasterOnboardingStep currentStep = null;
        int completedCount = 0;

        for (MasterOnboardingStep masterStep : masterSteps) {
            MechanicOnboardingJourney journey = journeyMap.get(masterStep.getStepCode());
            String status = journey != null ? journey.getStatus().name() : OnboardingStepStatus.IN_PROGRESS.name();
            String remarks = journey != null ? journey.getRemarks() : null;

            if (journey != null && journey.getStatus() == OnboardingStepStatus.COMPLETED) {
                completedCount++;
            } else if (currentStep == null) {
                currentStep = masterStep;
            }

            stepDetails.add(MechanicOnboardingProgressResponse.StepDetail.builder()
                    .stepCode(masterStep.getStepCode().name())
                    .displayName(masterStep.getDisplayName())
                    .stepOrder(masterStep.getStepOrder())
                    .isMandatory(masterStep.getIsMandatory())
                    .status(status)
                    .remarks(remarks)
                    .build());
        }

        if (currentStep == null && !masterSteps.isEmpty()) {
            currentStep = masterSteps.get(masterSteps.size() - 1);
        }

        double progressPercentage = masterSteps.isEmpty() ? 0.0 : ((double) completedCount / masterSteps.size()) * 100.0;

        boolean isManualVerificationDone = journeys.stream()
                .anyMatch(j -> j.getOnboardingStep().getStepCode() == OnboardingStepCode.MANUAL_VERIFICATION
                        && j.getStatus() == OnboardingStepStatus.COMPLETED);

        String overallStatus;
        if (mechanic.getStatus() == UserStatus.ACTIVE) {
            overallStatus = "ACTIVE";
        } else if (isManualVerificationDone || completedCount >= masterSteps.size()) {
            overallStatus = "UNDER_REVIEW";
        } else if (completedCount > 0) {
            overallStatus = "IN_PROGRESS";
        } else {
            overallStatus = "PENDING";
        }

        return MechanicOnboardingProgressResponse.builder()
                .mechanicId(mechanic.getId().toString())
                .currentStepCode(currentStep != null ? currentStep.getStepCode().name() : null)
                .currentStepDisplayName(currentStep != null ? currentStep.getDisplayName() : null)
                .currentStepOrder(currentStep != null ? currentStep.getStepOrder() : 1)
                .totalSteps(masterSteps.size())
                .progressPercentage(Math.round(progressPercentage * 100.0) / 100.0)
                .overallStatus(overallStatus)
                .steps(stepDetails)
                .build();
    }

    @Override
    @Transactional
    public MechanicOnboardingProgressResponse saveBasicDetails(MechanicUser mechanic, BasicDetailsRequest request) {
        MechanicProfile profile = profileRepository.findByMechanic(mechanic)
                .orElseGet(() -> MechanicProfile.builder().mechanic(mechanic).hasShop(true).build());

        profile.setFullName(request.getFullName());
        profile.setExperience(request.getExperience());
        if (request.getProfilePhotoUrl() != null) {
            profile.setProfilePhotoUrl(request.getProfilePhotoUrl());
        }
        profileRepository.save(profile);

        // Update Mechanic names
        String[] parts = request.getFullName().trim().split("\\s+", 2);
        mechanic.setFirstName(parts[0]);
        mechanic.setLastName(parts.length > 1 ? parts[1] : "");
        mechanicUserRepository.save(mechanic);

        markStepCompleted(mechanic, OnboardingStepCode.BASIC_DETAILS);
        return getOnboardingProgress(mechanic);
    }

    @Override
    @Transactional
    public MechanicOnboardingProgressResponse saveShopDetails(MechanicUser mechanic, ShopDetailsRequest request) {
        MechanicProfile profile = profileRepository.findByMechanic(mechanic)
                .orElseGet(() -> MechanicProfile.builder().mechanic(mechanic).build());

        if (request.getShopName() == null || request.getShopName().isBlank()) {
            throw new BadRequestException("Shop name is compulsory.");
        }
        if (request.getShopAddress() == null || request.getShopAddress().isBlank()) {
            throw new BadRequestException("Shop address is compulsory.");
        }

        profile.setHasShop(true);
        profile.setShopName(request.getShopName().trim());
        profile.setShopAddress(request.getShopAddress().trim());
        profileRepository.save(profile);

        markStepCompleted(mechanic, OnboardingStepCode.SHOP_DETAILS);
        return getOnboardingProgress(mechanic);
    }

    @Override
    @Transactional
    public MechanicOnboardingProgressResponse saveServiceCategories(MechanicUser mechanic, ServiceCategoriesRequest request) {
        serviceRepository.deleteByMechanic(mechanic);
        serviceRepository.flush();

        List<String> selectedServices = request.getServices();
        if (Boolean.TRUE.equals(request.getSelectAll())) {
            selectedServices = List.of(
                    "General Service", "Engine Repair", "Brake Repair", "Electrical & Battery",
                    "Tyre & Wheel", "Oil Change", "Washing & Polishing", "Breakdown Support"
            );
        }

        if (selectedServices != null) {
            for (String serviceName : selectedServices) {
                MechanicServiceEntity entity = MechanicServiceEntity.builder()
                        .mechanic(mechanic)
                        .serviceName(serviceName)
                        .build();
                serviceRepository.save(entity);
            }
        }

        markStepCompleted(mechanic, OnboardingStepCode.SERVICE_CATEGORIES);
        return getOnboardingProgress(mechanic);
    }

    @Override
    @Transactional
    public MechanicOnboardingProgressResponse saveDocuments(MechanicUser mechanic, DocumentsRequest request) {
        saveOrUpdateDoc(mechanic, "AADHAAR", request.getAadhaarUrl());
        saveOrUpdateDoc(mechanic, "PAN", request.getPanUrl());
        saveOrUpdateDoc(mechanic, "DRIVING_LICENSE", request.getDrivingLicenseUrl());

        MechanicProfile profile = profileRepository.findByMechanic(mechanic).orElse(null);
        if (profile != null && Boolean.TRUE.equals(profile.getHasShop()) && request.getShopPhotoUrl() != null) {
            saveOrUpdateDoc(mechanic, "SHOP_PHOTO", request.getShopPhotoUrl());
        }
        if (request.getProfilePhotoUrl() != null) {
            saveOrUpdateDoc(mechanic, "PROFILE_PHOTO", request.getProfilePhotoUrl());
        }

        markStepCompleted(mechanic, OnboardingStepCode.DOCUMENTS);
        return getOnboardingProgress(mechanic);
    }

    @Override
    @Transactional
    public MechanicOnboardingProgressResponse saveBankDetails(MechanicUser mechanic, BankDetailsRequest request) {
        MechanicBankDetail bankDetail = bankDetailRepository.findByMechanic(mechanic)
                .orElseGet(() -> MechanicBankDetail.builder().mechanic(mechanic).build());

        bankDetail.setAccountHolderName(request.getAccountHolderName());
        bankDetail.setAccountNumber(request.getAccountNumber());
        bankDetail.setIfscCode(request.getIfscCode());
        bankDetail.setBankName(request.getBankName());
        bankDetailRepository.save(bankDetail);

        markStepCompleted(mechanic, OnboardingStepCode.BANK_DETAILS);
        return getOnboardingProgress(mechanic);
    }

    @Override
    @Transactional
    public MechanicOnboardingProgressResponse saveServiceRadius(MechanicUser mechanic, ServiceRadiusRequest request) {
        MechanicProfile profile = profileRepository.findByMechanic(mechanic)
                .orElseGet(() -> MechanicProfile.builder().mechanic(mechanic).build());

        profile.setServiceRadiusKm(request.getRadiusKm());
        profileRepository.save(profile);

        if (masterOnboardingStepRepository.findByStepCode(OnboardingStepCode.SERVICE_RADIUS).isPresent()) {
            markStepCompleted(mechanic, OnboardingStepCode.SERVICE_RADIUS);
        }

        return getOnboardingProgress(mechanic);
    }

    @Override
    @Transactional
    public MechanicOnboardingProgressResponse saveTrainingSop(MechanicUser mechanic) {
        if (masterOnboardingStepRepository.findByStepCode(OnboardingStepCode.TRAINING_SOP).isPresent()) {
            markStepCompleted(mechanic, OnboardingStepCode.TRAINING_SOP);
        }
        return getOnboardingProgress(mechanic);
    }

    @Override
    @Transactional
    public MechanicOnboardingProgressResponse completeStep(MechanicUser mechanic, String stepCode) {
        try {
            OnboardingStepCode code = OnboardingStepCode.valueOf(stepCode.toUpperCase());
            markStepCompleted(mechanic, code);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid onboarding step code: " + stepCode);
        }
        return getOnboardingProgress(mechanic);
    }

    @Override
    @Transactional
    public MechanicOnboardingProgressResponse submitForManualVerification(MechanicUser mechanic) {
        MasterOnboardingStep step = masterOnboardingStepRepository.findByStepCode(OnboardingStepCode.MANUAL_VERIFICATION)
                .orElseThrow(() -> new ResourceNotFoundException("Onboarding step not found: MANUAL_VERIFICATION"));

        Optional<MechanicOnboardingJourney> optionalJourney = journeyRepository.findByMechanicIdOrderByCreatedAtAsc(mechanic.getId())
                .stream()
                .filter(j -> j.getOnboardingStep().getStepCode() == OnboardingStepCode.MANUAL_VERIFICATION)
                .findFirst();

        MechanicOnboardingJourney journey = optionalJourney.orElseGet(() -> {
            MechanicOnboardingJourney newJ = new MechanicOnboardingJourney();
            newJ.setMechanic(mechanic);
            newJ.setOnboardingStep(step);
            return newJ;
        });

        journey.setStatus(OnboardingStepStatus.COMPLETED);
        journey.setRemarks("Application submitted successfully. Waiting for Admin manual verification.");
        journeyRepository.save(journey);

        mechanic.setStatus(UserStatus.INACTIVE); // Remains INACTIVE until Admin approves
        mechanicUserRepository.save(mechanic);

        System.out.println("=================================================================");
        System.out.println("[ADMIN NOTIFICATION LOG] Mechanic Onboarding Application Submitted!");
        System.out.println("Mechanic ID: " + mechanic.getId() + " | Mobile: " + mechanic.getMobileNumber());
        System.out.println("Status: INACTIVE (Pending Admin Verification)");
        System.out.println("=================================================================");

        return getOnboardingProgress(mechanic);
    }

    private void saveOrUpdateDoc(MechanicUser mechanic, String docType, String docUrl) {
        if (docUrl == null || docUrl.isBlank()) return;
        MechanicDocument doc = documentRepository.findByMechanicAndDocumentType(mechanic, docType)
                .orElseGet(() -> MechanicDocument.builder().mechanic(mechanic).documentType(docType).build());
        doc.setDocumentUrl(docUrl);
        doc.setVerificationStatus("PENDING");
        documentRepository.save(doc);
    }

    private void markStepCompleted(MechanicUser mechanic, OnboardingStepCode stepCode) {
        MasterOnboardingStep step = masterOnboardingStepRepository.findByStepCode(stepCode)
                .orElseThrow(() -> new ResourceNotFoundException("Onboarding step not found: " + stepCode));

        Optional<MechanicOnboardingJourney> optionalJourney = journeyRepository.findByMechanicIdOrderByCreatedAtAsc(mechanic.getId())
                .stream()
                .filter(j -> j.getOnboardingStep().getStepCode() == stepCode)
                .findFirst();

        MechanicOnboardingJourney journey = optionalJourney.orElseGet(() -> {
            MechanicOnboardingJourney newJ = new MechanicOnboardingJourney();
            newJ.setMechanic(mechanic);
            newJ.setOnboardingStep(step);
            return newJ;
        });

        journey.setStatus(OnboardingStepStatus.COMPLETED);
        journeyRepository.save(journey);

        // Also ensure next step has an IN_PROGRESS entry if not already present
        List<MasterOnboardingStep> masterSteps = masterOnboardingStepRepository.findByIsActiveTrueOrderByStepOrderAsc();
        for (int i = 0; i < masterSteps.size() - 1; i++) {
            if (masterSteps.get(i).getStepCode() == stepCode) {
                MasterOnboardingStep nextStep = masterSteps.get(i + 1);
                Optional<MechanicOnboardingJourney> nextJourney = journeyRepository.findByMechanicIdOrderByCreatedAtAsc(mechanic.getId())
                        .stream()
                        .filter(j -> j.getOnboardingStep().getStepCode() == nextStep.getStepCode())
                        .findFirst();

                if (nextJourney.isEmpty()) {
                    MechanicOnboardingJourney newNextJ = new MechanicOnboardingJourney();
                    newNextJ.setMechanic(mechanic);
                    newNextJ.setOnboardingStep(nextStep);
                    newNextJ.setStatus(OnboardingStepStatus.IN_PROGRESS);
                    journeyRepository.save(newNextJ);
                }
                break;
            }
        }
    }
}
