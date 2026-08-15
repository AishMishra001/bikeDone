package com.bikedone.order_management_service.service.impl;

import com.bikedone.order_management_service.dto.request.ServiceabilityPincodeRequest;
import com.bikedone.order_management_service.dto.response.ServiceabilityResponse;
import com.bikedone.order_management_service.dto.response.ServiceabilityResponse.ServiceableZoneDto;
import com.bikedone.order_management_service.entity.ServiceablePincode;
import com.bikedone.order_management_service.exception.ResourceNotFoundException;
import com.bikedone.order_management_service.repository.ServiceablePincodeRepository;
import com.bikedone.order_management_service.service.ServiceabilityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServiceabilityServiceImpl implements ServiceabilityService {

    private final ServiceablePincodeRepository serviceablePincodeRepository;

    @Override
    @Transactional(readOnly = true)
    public ServiceabilityResponse checkServiceability(
            String pincode,
            Double latitude,
            Double longitude,
            String addressText
    ) {
        List<ServiceablePincode> activeList = serviceablePincodeRepository.findAllByIsActiveTrue();
        List<ServiceableZoneDto> zoneDtos = activeList.stream()
                .map(this::mapToZoneDto)
                .collect(Collectors.toList());

        // 1. Check exact Pincode in Database
        if (pincode != null && !pincode.trim().isEmpty()) {
            String cleanPin = pincode.trim();
            Optional<ServiceablePincode> matched = activeList.stream()
                    .filter(p -> p.getPincode().equalsIgnoreCase(cleanPin))
                    .findFirst();

            if (matched.isPresent()) {
                ServiceablePincode p = matched.get();
                return ServiceabilityResponse.builder()
                        .isServiceable(true)
                        .pincode(p.getPincode())
                        .areaName(p.getAreaName())
                        .city(p.getCity())
                        .state(p.getState())
                        .message("Service is operational in " + p.getAreaName() + " (" + p.getPincode() + ").")
                        .activeZones(zoneDtos)
                        .build();
            }
        }

        // 2. Check GPS coordinates proximity against all active zones in DB
        if (latitude != null && longitude != null) {
            for (ServiceablePincode zone : activeList) {
                if (zone.getLatitude() != null && zone.getLongitude() != null) {
                    double distKm = calculateDistanceKm(
                            latitude,
                            longitude,
                            zone.getLatitude().doubleValue(),
                            zone.getLongitude().doubleValue()
                    );
                    double allowedRadius = zone.getRadiusKm() != null ? zone.getRadiusKm().doubleValue() : 5.0;

                    if (distKm <= allowedRadius) {
                        return ServiceabilityResponse.builder()
                                .isServiceable(true)
                                .pincode(zone.getPincode())
                                .areaName(zone.getAreaName())
                                .city(zone.getCity())
                                .state(zone.getState())
                                .message("Service is operational in " + zone.getAreaName() + ".")
                                .activeZones(zoneDtos)
                                .build();
                    }
                }
            }
        }

        // 3. Check Address / Area text keywords matching active database entries
        if (addressText != null && !addressText.trim().isEmpty()) {
            String lowerAddress = addressText.toLowerCase();
            for (ServiceablePincode zone : activeList) {
                if (lowerAddress.contains(zone.getPincode().toLowerCase())
                        || lowerAddress.contains(zone.getCity().toLowerCase())
                        || lowerAddress.contains(zone.getAreaName().toLowerCase())) {
                    return ServiceabilityResponse.builder()
                            .isServiceable(true)
                            .pincode(zone.getPincode())
                            .areaName(zone.getAreaName())
                            .city(zone.getCity())
                            .state(zone.getState())
                            .message("Service is operational in " + zone.getCity() + ".")
                            .activeZones(zoneDtos)
                            .build();
                }
            }
        }

        // Not serviceable in current area
        String detectedCity = (addressText != null && addressText.toLowerCase().contains("delhi")) ? "New Delhi" : "Your Area";
        return ServiceabilityResponse.builder()
                .isServiceable(false)
                .city(detectedCity)
                .message("BikeDone is currently serviceable only in active Noida & Greater Noida zones. Expanding to your area soon!")
                .activeZones(zoneDtos)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceableZoneDto> getAllActiveZones() {
        return serviceablePincodeRepository.findAllByIsActiveTrue()
                .stream()
                .map(this::mapToZoneDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceablePincode> getAllPincodes() {
        return serviceablePincodeRepository.findAll();
    }

    @Override
    @Transactional
    public ServiceablePincode addOrUpdatePincode(ServiceabilityPincodeRequest request) {
        String pin = request.getPincode().trim();
        ServiceablePincode entity = serviceablePincodeRepository.findByPincode(pin)
                .orElse(ServiceablePincode.builder().pincode(pin).build());

        entity.setAreaName(request.getAreaName().trim());
        if (request.getCity() != null) entity.setCity(request.getCity().trim());
        if (request.getState() != null) entity.setState(request.getState().trim());
        if (request.getLatitude() != null) entity.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) entity.setLongitude(request.getLongitude());
        if (request.getRadiusKm() != null) entity.setRadiusKm(request.getRadiusKm());
        if (request.getIsActive() != null) entity.setIsActive(request.getIsActive());

        return serviceablePincodeRepository.save(entity);
    }

    @Override
    @Transactional
    public ServiceablePincode togglePincodeActive(String pincode, Boolean isActive) {
        ServiceablePincode entity = serviceablePincodeRepository.findByPincode(pincode.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Pincode " + pincode + " not found."));

        entity.setIsActive(isActive != null ? isActive : !Boolean.TRUE.equals(entity.getIsActive()));
        return serviceablePincodeRepository.save(entity);
    }

    @Override
    @Transactional
    public void deletePincode(String pincode) {
        ServiceablePincode entity = serviceablePincodeRepository.findByPincode(pincode.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Pincode " + pincode + " not found."));
        serviceablePincodeRepository.delete(entity);
    }

    private ServiceableZoneDto mapToZoneDto(ServiceablePincode entity) {
        return ServiceableZoneDto.builder()
                .id(entity.getId())
                .pincode(entity.getPincode())
                .areaName(entity.getAreaName())
                .city(entity.getCity())
                .state(entity.getState())
                .latitude(entity.getLatitude() != null ? entity.getLatitude().doubleValue() : null)
                .longitude(entity.getLongitude() != null ? entity.getLongitude().doubleValue() : null)
                .radiusKm(entity.getRadiusKm() != null ? entity.getRadiusKm().doubleValue() : null)
                .isActive(entity.getIsActive())
                .build();
    }

    private double calculateDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth's radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
