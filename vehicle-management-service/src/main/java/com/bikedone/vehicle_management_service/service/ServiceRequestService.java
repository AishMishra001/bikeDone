package com.bikedone.vehicle_management_service.service;

import com.bikedone.vehicle_management_service.dto.request.CreateServiceRequestRequest;
import com.bikedone.vehicle_management_service.dto.response.CreateServiceRequestResponse;

public interface ServiceRequestService {

    CreateServiceRequestResponse createServiceRequest(
            CreateServiceRequestRequest request
    );

}