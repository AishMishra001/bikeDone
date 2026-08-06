package com.bikedone.order_management_service.mapper;

import com.bikedone.order_management_service.dto.request.CreateServiceRequestRequest;
import com.bikedone.order_management_service.dto.response.CreateServiceRequestResponse;
import com.bikedone.order_management_service.dto.response.MyServiceRequestResponse;
import com.bikedone.order_management_service.entity.RequestType;
import com.bikedone.order_management_service.entity.ServiceIssue;
import com.bikedone.order_management_service.entity.ServiceRequest;
import com.bikedone.order_management_service.entity.ServiceRequestIssue;
import com.bikedone.order_management_service.entity.ServiceSlot;
import com.bikedone.order_management_service.enums.ServiceRequestStatus;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class ServiceRequestMapper {

    public ServiceRequest toEntity(
            CreateServiceRequestRequest request,
            UUID customerId,
            String requestNumber,
            RequestType requestType,
            ServiceSlot serviceSlot) {

        ServiceRequest serviceRequest = new ServiceRequest();

        serviceRequest.setRequestNumber(requestNumber);
        serviceRequest.setCustomerId(customerId);
        serviceRequest.setCustomerVehicleId(request.getCustomerVehicleId());
        serviceRequest.setAddressId(request.getAddressId());
        serviceRequest.setRequestType(requestType);
        serviceRequest.setPreferredServiceDate(request.getPreferredServiceDate());
        serviceRequest.setServiceSlot(serviceSlot);
        serviceRequest.setIssueIdentified(request.getIsIssueIdentified());
        serviceRequest.setDescription(request.getDescription());
        serviceRequest.setStatus(ServiceRequestStatus.REQUEST_CREATED);
        serviceRequest.setIsActive(true);

        return serviceRequest;
    }

    public ServiceRequestIssue toIssue(
            ServiceRequest serviceRequest,
            ServiceIssue serviceIssue) {

        ServiceRequestIssue requestIssue = new ServiceRequestIssue();

        requestIssue.setServiceRequest(serviceRequest);
        requestIssue.setServiceIssue(serviceIssue);

        return requestIssue;
    }

    public CreateServiceRequestResponse toResponse(
            ServiceRequest serviceRequest) {

        return new CreateServiceRequestResponse(
                serviceRequest.getId(),
                serviceRequest.getRequestNumber(),
                serviceRequest.getStatus()
        );
    }

    public MyServiceRequestResponse toMyServiceRequestResponse(
            ServiceRequest serviceRequest) {

        return MyServiceRequestResponse.builder()
                .id(serviceRequest.getId())
                .requestNumber(serviceRequest.getRequestNumber())
                .requestType(serviceRequest.getRequestType().getDisplayName())
                .status(serviceRequest.getStatus())
                .preferredServiceDate(serviceRequest.getPreferredServiceDate())
                .serviceSlot(serviceRequest.getServiceSlot().getSlotName())
                .customerVehicleId(serviceRequest.getCustomerVehicleId())
                .build();
    }
}