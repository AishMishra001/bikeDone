package com.bikedone.usermanagement.mechanic.service.impl;

import com.bikedone.usermanagement.mechanic.dto.request.EligibleMechanicSearchRequest;
import com.bikedone.usermanagement.mechanic.dto.response.EligibleMechanicsResponse;
import com.bikedone.usermanagement.mechanic.entity.MechanicLocation;
import com.bikedone.usermanagement.mechanic.repository.MechanicLocationRepository;
import com.bikedone.usermanagement.mechanic.service.MechanicLocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MechanicLocationServiceImpl implements MechanicLocationService {

    private final MechanicLocationRepository mechanicLocationRepository;

    @Override
    @Transactional
    public void updateLocation(UUID mechanicId, BigDecimal latitude, BigDecimal longitude, Boolean isOnline) {
        MechanicLocation location = mechanicLocationRepository.findByMechanicId(mechanicId)
                .orElseGet(() -> MechanicLocation.builder()
                        .mechanicId(mechanicId)
                        .isOnline(true)
                        .isBusy(false)
                        .build());

        location.setLatitude(latitude);
        location.setLongitude(longitude);
        if (isOnline != null) {
            location.setIsOnline(isOnline);
        }
        location.setLastUpdatedAt(LocalDateTime.now());
        mechanicLocationRepository.save(location);
    }

    @Override
    @Transactional(readOnly = true)
    public EligibleMechanicsResponse findEligibleMechanics(EligibleMechanicSearchRequest request) {
        double radius = request.getRadiusKm() != null ? request.getRadiusKm() : 10.0;
        List<UUID> mechanicIds = mechanicLocationRepository.findEligibleMechanicsNearby(
                request.getLatitude(),
                request.getLongitude(),
                radius
        );

        return EligibleMechanicsResponse.builder()
                .eligibleMechanicIds(mechanicIds)
                .count(mechanicIds.size())
                .build();
    }
}
