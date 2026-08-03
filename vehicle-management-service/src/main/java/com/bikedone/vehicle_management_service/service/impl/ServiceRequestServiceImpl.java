package com.bikedone.vehicle_management_service.service.impl;

import com.bikedone.vehicle_management_service.common.logging.LogLevel;
import com.bikedone.vehicle_management_service.common.logging.LogStep;
import com.bikedone.vehicle_management_service.common.logging.Logger;
import com.bikedone.vehicle_management_service.dto.request.CancelServiceRequestRequest;
import com.bikedone.vehicle_management_service.dto.request.CreateServiceRequestRequest;
import com.bikedone.vehicle_management_service.dto.response.CreateServiceRequestResponse;
import com.bikedone.vehicle_management_service.dto.response.MyServiceRequestResponse;
import com.bikedone.vehicle_management_service.entity.RequestType;
import com.bikedone.vehicle_management_service.entity.ServiceCategory;
import com.bikedone.vehicle_management_service.entity.ServiceIssue;
import com.bikedone.vehicle_management_service.entity.ServiceRequest;
import com.bikedone.vehicle_management_service.entity.ServiceRequestIssue;
import com.bikedone.vehicle_management_service.entity.ServiceRequestTimeline;
import com.bikedone.vehicle_management_service.entity.ServiceSlot;
import com.bikedone.vehicle_management_service.enums.ServiceRequestStatus;
import com.bikedone.vehicle_management_service.exception.ResourceNotFoundException;
import com.bikedone.vehicle_management_service.mapper.ServiceRequestMapper;
import com.bikedone.vehicle_management_service.repository.RequestTypeRepository;
import com.bikedone.vehicle_management_service.repository.ServiceCategoryRepository;
import com.bikedone.vehicle_management_service.repository.ServiceIssueRepository;
import com.bikedone.vehicle_management_service.repository.ServiceRequestIssueRepository;
import com.bikedone.vehicle_management_service.repository.ServiceRequestRepository;
import com.bikedone.vehicle_management_service.repository.ServiceRequestTimelineRepository;
import com.bikedone.vehicle_management_service.security.authentication.AuthenticationFacade;
import com.bikedone.vehicle_management_service.service.ServiceRequestService;
import com.bikedone.vehicle_management_service.util.Constants;
import com.bikedone.vehicle_management_service.util.RequestNumberGenerator;
import com.bikedone.vehicle_management_service.util.ServiceRequestTimelineFactory;
import com.bikedone.vehicle_management_service.validation.CancelServiceRequestValidator;
import com.bikedone.vehicle_management_service.validation.CreateServiceRequestValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ServiceRequestServiceImpl implements ServiceRequestService {

    private final ServiceRequestRepository serviceRequestRepository;

    private final CreateServiceRequestValidator createServiceRequestValidator;

    private final RequestNumberGenerator requestNumberGenerator;

    private final ServiceIssueRepository serviceIssueRepository;

    private final AuthenticationFacade authenticationFacade;

    private final ServiceRequestMapper serviceRequestMapper;

    private final ServiceRequestTimelineFactory serviceRequestTimelineFactory;

    private final CancelServiceRequestValidator cancelServiceRequestValidator;

    @Override
    public CreateServiceRequestResponse createServiceRequest(
            CreateServiceRequestRequest request) {

        UUID customerId = authenticationFacade.getCurrentUserId();

        Logger.printLog(
                LogLevel.INFO,
                LogStep.SERVICE_REQUEST,
                "Creating service request",
                "customerId=" + customerId,
                customerId.toString(),
                null
        );

        createServiceRequestValidator.validate(request);

        RequestType requestType =
                createServiceRequestValidator.validateRequestType(
                        request.getRequestTypeId()
                );

        ServiceSlot serviceSlot =
                createServiceRequestValidator.validateServiceSlot(
                        request.getServiceSlotId()
                );

        if (Boolean.TRUE.equals(request.getIsIssueIdentified())) {
            createServiceRequestValidator.validateServiceCategory(
                    request.getServiceCategoryId()
            );
        }

        String requestNumber = requestNumberGenerator.generate();

        Logger.printLog(
                LogLevel.INFO,
                LogStep.SERVICE_REQUEST,
                "Request number generated",
                "requestNumber=" + requestNumber + " | customerId=" + customerId,
                customerId.toString(),
                null
        );

        ServiceRequest serviceRequest =
                serviceRequestMapper.toEntity(
                        request,
                        customerId,
                        requestNumber,
                        requestType,
                        serviceSlot
                );

        if (Boolean.TRUE.equals(request.getIsIssueIdentified())) {

            List<ServiceIssue> serviceIssues =
                    serviceIssueRepository.findAllByIdIn(
                            request.getServiceIssueIds()
                    );

            for (ServiceIssue serviceIssue : serviceIssues) {

                ServiceRequestIssue requestIssue =
                        serviceRequestMapper.toIssue(
                                serviceRequest,
                                serviceIssue
                        );

                serviceRequest.addIssue(requestIssue);
            }
        }

        ServiceRequestTimeline timeline =
                serviceRequestTimelineFactory.create(
                        serviceRequest,
                        ServiceRequestStatus.REQUEST_CREATED,
                        Constants.REQUEST_CREATED,
                        customerId
                );

        serviceRequest.addTimeline(timeline);

        ServiceRequest savedRequest = serviceRequestRepository.save(serviceRequest);

        Logger.printLog(
                LogLevel.INFO,
                LogStep.SERVICE_REQUEST,
                "Service request created successfully",
                "requestId=" + savedRequest.getId() + " | requestNumber=" + savedRequest.getRequestNumber() + " | customerId=" + customerId,
                customerId.toString(),
                savedRequest.getId().toString()
        );

        return serviceRequestMapper.toResponse(savedRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MyServiceRequestResponse> getMyServiceRequests() {

        UUID customerId = authenticationFacade.getCurrentUserId();

        Logger.printLog(
                LogLevel.INFO,
                LogStep.SERVICE_REQUEST,
                "Fetching service requests for customer",
                "customerId=" + customerId,
                customerId.toString(),
                null
        );

        List<MyServiceRequestResponse> result = serviceRequestRepository
                .findByCustomerIdAndIsActiveTrueOrderByCreatedAtDesc(customerId)
                .stream()
                .map(serviceRequestMapper::toMyServiceRequestResponse)
                .toList();

        Logger.printLog(
                LogLevel.INFO,
                LogStep.SERVICE_REQUEST,
                "Service requests fetched successfully",
                "Returned " + result.size() + " request(s) for customerId=" + customerId,
                customerId.toString(),
                null
        );

        return result;
    }

    @Override
    public CreateServiceRequestResponse cancelServiceRequest(
            UUID requestId,
            CancelServiceRequestRequest request) {

        UUID customerId = authenticationFacade.getCurrentUserId();

        Logger.printLog(
                LogLevel.INFO,
                LogStep.SERVICE_REQUEST,
                "Cancelling service request",
                "requestId=" + requestId + " | customerId=" + customerId,
                customerId.toString(),
                requestId.toString()
        );

        ServiceRequest serviceRequest =
                serviceRequestRepository
                        .findByIdAndCustomerIdAndIsActiveTrue(
                                requestId,
                                customerId
                        )
                        .orElseThrow(() -> {
                            Logger.printLog(
                                    LogLevel.WARN,
                                    LogStep.SERVICE_REQUEST,
                                    "Service request not found for cancellation",
                                    "requestId=" + requestId + " | customerId=" + customerId,
                                    customerId.toString(),
                                    requestId.toString()
                            );
                            return new ResourceNotFoundException("Service request not found.");
                        });

        cancelServiceRequestValidator.validate(serviceRequest);

        serviceRequest.setStatus(ServiceRequestStatus.CANCELLED);
        serviceRequest.setCancellationReason(request.getReason());

        ServiceRequestTimeline timeline =
                serviceRequestTimelineFactory.create(
                        serviceRequest,
                        ServiceRequestStatus.CANCELLED,
                        "Service request cancelled by customer.",
                        customerId
                );

        serviceRequest.addTimeline(timeline);

        ServiceRequest savedRequest =
                serviceRequestRepository.save(serviceRequest);

        Logger.printLog(
                LogLevel.INFO,
                LogStep.SERVICE_REQUEST,
                "Service request cancelled successfully",
                "requestId=" + savedRequest.getId() + " | customerId=" + customerId,
                customerId.toString(),
                savedRequest.getId().toString()
        );

        return serviceRequestMapper.toResponse(savedRequest);
    }
}
