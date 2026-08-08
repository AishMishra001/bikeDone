package com.bikedone.usermanagement.mechanic.service;

import com.bikedone.usermanagement.mechanic.dto.request.EligibleMechanicSearchRequest;
import com.bikedone.usermanagement.mechanic.dto.response.EligibleMechanicsResponse;

import java.math.BigDecimal;
import java.util.UUID;

public interface MechanicLocationService {

    void updateLocation(UUID mechanicId, BigDecimal latitude, BigDecimal longitude, Boolean isOnline);

    EligibleMechanicsResponse findEligibleMechanics(EligibleMechanicSearchRequest request);
}
