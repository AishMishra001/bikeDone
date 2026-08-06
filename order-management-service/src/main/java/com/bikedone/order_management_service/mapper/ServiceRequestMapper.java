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
import java.util.List;
import java.time.LocalDate;
import java.time.LocalTime;

@Component
public class ServiceRequestMapper {

    public ServiceRequest toEntity(
            CreateServiceRequestRequest request,
            UUID customerId,
            String requestNumber,
            RequestType requestType,
            ServiceSlot serviceSlot,
            LocalDate preferredServiceDate,
            LocalTime preferredServiceTime) {

        ServiceRequest serviceRequest = new ServiceRequest();

        serviceRequest.setRequestNumber(requestNumber);
        serviceRequest.setCustomerId(customerId);
        serviceRequest.setCustomerVehicleId(request.getCustomerVehicleId());
        serviceRequest.setAddressId(request.getAddressId());
        if (request.getCurrentLocation() != null) {
            serviceRequest.setCurrentLocationLatitude(request.getCurrentLocation().getLatitude());
            serviceRequest.setCurrentLocationLongitude(request.getCurrentLocation().getLongitude());
            serviceRequest.setCurrentLocationNote(request.getCurrentLocation().getNote());
        }
        serviceRequest.setRequestType(requestType);
        serviceRequest.setPreferredServiceDate(preferredServiceDate);
        serviceRequest.setPreferredServiceTime(preferredServiceTime);
        serviceRequest.setIsImmediate(request.getIsImmediate());
        serviceRequest.setServiceSlot(serviceSlot);
        serviceRequest.setIssueIdentified(request.getIsIssueIdentified());
        serviceRequest.setDescription(request.getDescription());

        // Convert list of URLs to comma-separated string for storage
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            serviceRequest.setImageUrls(String.join(",", request.getImageUrls()));
        }

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

        // Parse comma-separated image URLs back to a list
        List<String> imageUrls = (serviceRequest.getImageUrls() != null
                && !serviceRequest.getImageUrls().isBlank())
                ? List.of(serviceRequest.getImageUrls().split(","))
                : List.of();

        return MyServiceRequestResponse.builder()
                .id(serviceRequest.getId())
                .requestNumber(serviceRequest.getRequestNumber())
                .requestType(serviceRequest.getRequestType().getDisplayName())
                .status(serviceRequest.getStatus())
                .preferredServiceDate(serviceRequest.getPreferredServiceDate())
                .preferredServiceTime(serviceRequest.getPreferredServiceTime())
                .isImmediate(serviceRequest.getIsImmediate())
                .serviceSlot(serviceRequest.getServiceSlot() == null
                        ? null
                        : serviceRequest.getServiceSlot().getSlotName())
                .customerVehicleId(serviceRequest.getCustomerVehicleId())
                .imageUrls(imageUrls)
                .build();
    }
}
