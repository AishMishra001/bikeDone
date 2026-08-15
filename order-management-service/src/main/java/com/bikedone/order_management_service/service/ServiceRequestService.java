package com.bikedone.order_management_service.service;

import com.bikedone.order_management_service.dto.request.CancelServiceRequestRequest;
import com.bikedone.order_management_service.dto.request.CreateServiceRequestRequest;
import com.bikedone.order_management_service.dto.request.RescheduleServiceRequestRequest;
import com.bikedone.order_management_service.dto.response.CreateServiceRequestResponse;
import com.bikedone.order_management_service.dto.response.MyServiceRequestResponse;

import java.util.List;
import java.util.UUID;

public interface ServiceRequestService {

    CreateServiceRequestResponse createServiceRequest(
            CreateServiceRequestRequest request
    );

    List<MyServiceRequestResponse> getMyServiceRequests();

    MyServiceRequestResponse getActiveServiceRequestForMechanic(UUID mechanicId);

    MyServiceRequestResponse getServiceRequestById(UUID requestId);

    CreateServiceRequestResponse cancelServiceRequest(
            UUID requestId,
            CancelServiceRequestRequest request
    );

    CreateServiceRequestResponse rescheduleServiceRequest(
            UUID requestId,
            RescheduleServiceRequestRequest request
    );

    CreateServiceRequestResponse updateServiceRequestStatus(
            UUID requestId,
            com.bikedone.order_management_service.enums.ServiceRequestStatus status
    );

    MyServiceRequestResponse updateExtraAmount(
            UUID requestId,
            java.math.BigDecimal extraAmount
    );
}
