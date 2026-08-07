package com.bikedone.order_management_service.util;

import com.bikedone.order_management_service.entity.ServiceRequest;
import com.bikedone.order_management_service.entity.ServiceRequestTimeline;
import com.bikedone.order_management_service.enums.ServiceRequestStatus;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class ServiceRequestTimelineFactory {

    public ServiceRequestTimeline create(
            ServiceRequest serviceRequest,
            ServiceRequestStatus status,
            String remarks,
            UUID createdBy) {

        ServiceRequestTimeline timeline = new ServiceRequestTimeline();

        timeline.setServiceRequest(serviceRequest);
        timeline.setStatus(status);
        timeline.setRemarks(remarks);
        timeline.setCreatedBy(createdBy);

        return timeline;
    }
}