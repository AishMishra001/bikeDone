package com.bikedone.vehicle_management_service.service;

import com.bikedone.vehicle_management_service.dto.request.CancelServiceRequestRequest;
import com.bikedone.vehicle_management_service.dto.request.CreateServiceRequestRequest;
import com.bikedone.vehicle_management_service.dto.response.CreateServiceRequestResponse;
import com.bikedone.vehicle_management_service.dto.response.MyServiceRequestResponse;

import java.util.List;
import java.util.UUID;

public interface ServiceRequestService {

    CreateServiceRequestResponse createServiceRequest(
            CreateServiceRequestRequest request
    );

    List<MyServiceRequestResponse> getMyServiceRequests();

    CreateServiceRequestResponse cancelServiceRequest(
            UUID requestId,
            CancelServiceRequestRequest request
    );

}