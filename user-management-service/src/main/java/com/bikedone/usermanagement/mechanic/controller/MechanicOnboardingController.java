package com.bikedone.usermanagement.mechanic.controller;

import com.bikedone.usermanagement.common.datetime.DateTimeProvider;
import com.bikedone.usermanagement.common.response.ApiResponse;
import com.bikedone.usermanagement.mechanic.dto.request.*;
import com.bikedone.usermanagement.mechanic.dto.response.MechanicOnboardingProgressResponse;
import com.bikedone.usermanagement.mechanic.entity.MechanicUser;
import com.bikedone.usermanagement.mechanic.service.MechanicOnboardingService;
import com.bikedone.usermanagement.security.user.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/mechanics/onboarding")
@RequiredArgsConstructor
@PreAuthorize("hasRole('MECHANIC')")
public class MechanicOnboardingController {

    private final MechanicOnboardingService onboardingService;
    private final DateTimeProvider dateTimeProvider;

    @GetMapping
    public ApiResponse<MechanicOnboardingProgressResponse> getOnboardingProgress(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        MechanicUser mechanic = principal.getMechanicUser();
        MechanicOnboardingProgressResponse response = onboardingService.getOnboardingProgress(mechanic);

        return ApiResponse.<MechanicOnboardingProgressResponse>builder()
                .success(true)
                .message("Mechanic onboarding progress fetched successfully.")
                .data(response)
                .timestamp(dateTimeProvider.now())
                .build();
    }

    @PostMapping("/basic-details")
    public ApiResponse<MechanicOnboardingProgressResponse> saveBasicDetails(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody BasicDetailsRequest request
    ) {
        MechanicUser mechanic = principal.getMechanicUser();
        MechanicOnboardingProgressResponse response = onboardingService.saveBasicDetails(mechanic, request);

        return ApiResponse.<MechanicOnboardingProgressResponse>builder()
                .success(true)
                .message("Basic details saved successfully.")
                .data(response)
                .timestamp(dateTimeProvider.now())
                .build();
    }

    @PostMapping("/shop-details")
    public ApiResponse<MechanicOnboardingProgressResponse> saveShopDetails(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ShopDetailsRequest request
    ) {
        MechanicUser mechanic = principal.getMechanicUser();
        MechanicOnboardingProgressResponse response = onboardingService.saveShopDetails(mechanic, request);

        return ApiResponse.<MechanicOnboardingProgressResponse>builder()
                .success(true)
                .message("Shop details saved successfully.")
                .data(response)
                .timestamp(dateTimeProvider.now())
                .build();
    }

    @PostMapping("/service-categories")
    public ApiResponse<MechanicOnboardingProgressResponse> saveServiceCategories(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ServiceCategoriesRequest request
    ) {
        MechanicUser mechanic = principal.getMechanicUser();
        MechanicOnboardingProgressResponse response = onboardingService.saveServiceCategories(mechanic, request);

        return ApiResponse.<MechanicOnboardingProgressResponse>builder()
                .success(true)
                .message("Service categories saved successfully.")
                .data(response)
                .timestamp(dateTimeProvider.now())
                .build();
    }

    @PostMapping("/documents")
    public ApiResponse<MechanicOnboardingProgressResponse> saveDocuments(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody DocumentsRequest request
    ) {
        MechanicUser mechanic = principal.getMechanicUser();
        MechanicOnboardingProgressResponse response = onboardingService.saveDocuments(mechanic, request);

        return ApiResponse.<MechanicOnboardingProgressResponse>builder()
                .success(true)
                .message("Documents saved successfully.")
                .data(response)
                .timestamp(dateTimeProvider.now())
                .build();
    }

    @PostMapping("/bank-details")
    public ApiResponse<MechanicOnboardingProgressResponse> saveBankDetails(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody BankDetailsRequest request
    ) {
        MechanicUser mechanic = principal.getMechanicUser();
        MechanicOnboardingProgressResponse response = onboardingService.saveBankDetails(mechanic, request);

        return ApiResponse.<MechanicOnboardingProgressResponse>builder()
                .success(true)
                .message("Bank details saved successfully.")
                .data(response)
                .timestamp(dateTimeProvider.now())
                .build();
    }

    @PostMapping("/service-radius")
    public ApiResponse<MechanicOnboardingProgressResponse> saveServiceRadius(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ServiceRadiusRequest request
    ) {
        MechanicUser mechanic = principal.getMechanicUser();
        MechanicOnboardingProgressResponse response = onboardingService.saveServiceRadius(mechanic, request);

        return ApiResponse.<MechanicOnboardingProgressResponse>builder()
                .success(true)
                .message("Service radius saved successfully.")
                .data(response)
                .timestamp(dateTimeProvider.now())
                .build();
    }

    @PostMapping("/submit-verification")
    public ApiResponse<MechanicOnboardingProgressResponse> submitForManualVerification(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        MechanicUser mechanic = principal.getMechanicUser();
        MechanicOnboardingProgressResponse response = onboardingService.submitForManualVerification(mechanic);

        return ApiResponse.<MechanicOnboardingProgressResponse>builder()
                .success(true)
                .message("Submitted for manual verification successfully.")
                .data(response)
                .timestamp(dateTimeProvider.now())
                .build();
    }
}
