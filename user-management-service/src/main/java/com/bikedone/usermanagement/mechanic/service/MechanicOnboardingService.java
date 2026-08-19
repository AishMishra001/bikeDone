package com.bikedone.usermanagement.mechanic.service;

import com.bikedone.usermanagement.mechanic.dto.request.*;
import com.bikedone.usermanagement.mechanic.dto.response.MechanicOnboardingProgressResponse;
import com.bikedone.usermanagement.mechanic.entity.MechanicUser;

public interface MechanicOnboardingService {

    MechanicOnboardingProgressResponse getOnboardingProgress(MechanicUser mechanic);

    MechanicOnboardingProgressResponse saveBasicDetails(MechanicUser mechanic, BasicDetailsRequest request);

    MechanicOnboardingProgressResponse saveShopDetails(MechanicUser mechanic, ShopDetailsRequest request);

    MechanicOnboardingProgressResponse saveServiceCategories(MechanicUser mechanic, ServiceCategoriesRequest request);

    MechanicOnboardingProgressResponse saveDocuments(MechanicUser mechanic, DocumentsRequest request);

    MechanicOnboardingProgressResponse saveBankDetails(MechanicUser mechanic, BankDetailsRequest request);

    MechanicOnboardingProgressResponse saveServiceRadius(MechanicUser mechanic, ServiceRadiusRequest request);

    MechanicOnboardingProgressResponse saveTrainingSop(MechanicUser mechanic);

    MechanicOnboardingProgressResponse completeStep(MechanicUser mechanic, String stepCode);

    MechanicOnboardingProgressResponse submitForManualVerification(MechanicUser mechanic);
}