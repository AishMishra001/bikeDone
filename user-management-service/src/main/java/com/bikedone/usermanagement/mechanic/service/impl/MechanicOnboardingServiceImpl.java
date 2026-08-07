package com.bikedone.usermanagement.mechanic.service.impl;

import com.bikedone.usermanagement.mechanic.dto.response.GetMechanicOnboardingResponse;
import com.bikedone.usermanagement.mechanic.mapper.MechanicOnboardingMapper;
import com.bikedone.usermanagement.mechanic.repository.MasterOnboardingStepRepository;
import com.bikedone.usermanagement.mechanic.repository.MechanicOnboardingJourneyRepository;
import com.bikedone.usermanagement.mechanic.service.MechanicOnboardingService;
import com.bikedone.usermanagement.security.authentication.AuthenticationFacade;
import com.bikedone.usermanagement.security.user.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class MechanicOnboardingServiceImpl
        implements MechanicOnboardingService {

    private final AuthenticationFacade authenticationFacade;

    private final MasterOnboardingStepRepository
            masterOnboardingStepRepository;

    private final MechanicOnboardingJourneyRepository
            mechanicOnboardingJourneyRepository;

    private final MechanicOnboardingMapper
            mechanicOnboardingMapper;

    @Override
    public GetMechanicOnboardingResponse getOnboarding() {

        UserPrincipal mechanicId = authenticationFacade.getCurrentUser();

        return null;
    }
}
