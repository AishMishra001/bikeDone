package com.bikedone.order_management_service.service.dispatch;

import com.bikedone.order_management_service.dto.response.PendingJobNotificationResponse;
import com.bikedone.order_management_service.entity.ServiceRequest;

import java.util.UUID;

public interface DispatchEngineService {

    void startDispatch(ServiceRequest serviceRequest);

    void processRetryRound(UUID serviceRequestId, UUID dispatchRunId, int currentRound);

    boolean acceptServiceRequest(UUID serviceRequestId, UUID mechanicId);

    PendingJobNotificationResponse getPendingNotificationForMechanic(UUID mechanicId);
}
