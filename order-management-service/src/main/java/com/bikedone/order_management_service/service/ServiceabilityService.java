package com.bikedone.order_management_service.service;

import com.bikedone.order_management_service.dto.request.ServiceabilityPincodeRequest;
import com.bikedone.order_management_service.dto.response.ServiceabilityResponse;
import com.bikedone.order_management_service.entity.ServiceablePincode;

import java.util.List;

public interface ServiceabilityService {

    ServiceabilityResponse checkServiceability(String pincode, Double latitude, Double longitude, String addressText);

    List<ServiceabilityResponse.ServiceableZoneDto> getAllActiveZones();

    List<ServiceablePincode> getAllPincodes();

    ServiceablePincode addOrUpdatePincode(ServiceabilityPincodeRequest request);

    ServiceablePincode togglePincodeActive(String pincode, Boolean isActive);

    void deletePincode(String pincode);
}
