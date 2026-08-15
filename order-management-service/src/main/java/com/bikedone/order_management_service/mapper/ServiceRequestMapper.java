package com.bikedone.order_management_service.mapper;

import com.bikedone.order_management_service.dto.request.CreateServiceRequestRequest;
import com.bikedone.order_management_service.dto.response.CreateServiceRequestResponse;
import com.bikedone.order_management_service.dto.response.MyServiceRequestResponse;
import com.bikedone.order_management_service.entity.CustomerVehicle;
import com.bikedone.order_management_service.entity.RequestType;
import com.bikedone.order_management_service.entity.ServiceIssue;
import com.bikedone.order_management_service.entity.ServiceRequest;
import com.bikedone.order_management_service.entity.ServiceRequestIssue;
import com.bikedone.order_management_service.entity.ServiceSlot;
import com.bikedone.order_management_service.enums.ServiceRequestStatus;
import com.bikedone.order_management_service.repository.CustomerVehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;
import java.time.LocalDate;
import java.time.LocalTime;

@Component
@RequiredArgsConstructor
public class ServiceRequestMapper {

    private final CustomerVehicleRepository customerVehicleRepository;
    private final com.bikedone.order_management_service.repository.OrderBillBreakdownRepository orderBillBreakdownRepository;

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

        // Generate 4 digit pin
        String pin = String.format("%04d", new java.util.Random().nextInt(10000));
        serviceRequest.setServicePin(pin);

        if (request.getCurrentLocation() != null) {
            // User chose live current location
            serviceRequest.setCurrentLocationLatitude(request.getCurrentLocation().getLatitude());
            serviceRequest.setCurrentLocationLongitude(request.getCurrentLocation().getLongitude());
            serviceRequest.setCurrentLocationNote(request.getCurrentLocation().getNote());
        } else if (request.getAddressId() != null) {
            // User chose a saved address — also populate location columns from the address details
            serviceRequest.setCurrentLocationLatitude(request.getAddressLatitude());
            serviceRequest.setCurrentLocationLongitude(request.getAddressLongitude());
            serviceRequest.setCurrentLocationNote(request.getAddressNote());
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

        // Resolve vehicle name + registration number
        String vehicleName = null;
        String vehicleRegNumber = null;
        CustomerVehicle vehicle = customerVehicleRepository
                .findByIdWithAssociations(serviceRequest.getCustomerVehicleId())
                .orElse(null);
        if (vehicle != null) {
            vehicleName = vehicle.getBrand().getBrandName()
                    + " " + vehicle.getModel().getModelName();
            vehicleRegNumber = vehicle.getRegistrationNumber();
        }

        // Resolve service address from current_location_note (set for both saved & live address)
        String serviceAddress = serviceRequest.getCurrentLocationNote();

        // Resolve bill breakdown details (total, extra tip, base)
        com.bikedone.order_management_service.entity.OrderBillBreakdown billBreakdown = orderBillBreakdownRepository
                .findByServiceRequestId(serviceRequest.getId())
                .orElse(null);

        java.math.BigDecimal totalPayableAmount = billBreakdown != null ? billBreakdown.getFinalPayableAmount() : null;
        java.math.BigDecimal extraAmount = billBreakdown != null ? billBreakdown.getExtraAmount() : java.math.BigDecimal.ZERO;
        java.math.BigDecimal baseCharge = billBreakdown != null ? billBreakdown.getBaseCharge() : null;

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
                .vehicleName(vehicleName)
                .vehicleRegistrationNumber(vehicleRegNumber)
                .serviceAddress(serviceAddress)
                .latitude(serviceRequest.getCurrentLocationLatitude())
                .longitude(serviceRequest.getCurrentLocationLongitude())
                .totalPayableAmount(totalPayableAmount)
                .extraAmount(extraAmount)
                .baseCharge(baseCharge)
                .assignedMechanicId(serviceRequest.getAssignedMechanicId())
                .servicePin(serviceRequest.getServicePin())
                .description(serviceRequest.getDescription())
                .imageUrls(imageUrls)
                .build();
    }
}
