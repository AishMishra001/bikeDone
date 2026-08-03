package com.bikedone.vehicle_management_service.service.impl;

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
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
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

        log.info("Creating service request for customerId={}", customerId);

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

        log.info(
                "Generated request number={} for customerId={}",
                requestNumber,
                customerId
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

        log.info(
                "Service request created successfully. requestId={}, requestNumber={}",
                savedRequest.getId(),
                savedRequest.getRequestNumber()
        );

        return serviceRequestMapper.toResponse(savedRequest);
    }


    @Override
    @Transactional(readOnly = true)
    public List<MyServiceRequestResponse> getMyServiceRequests() {

        UUID customerId = authenticationFacade.getCurrentUserId();

        log.info("Fetching service requests for customerId={}", customerId);

        return serviceRequestRepository
                .findByCustomerIdAndIsActiveTrueOrderByCreatedAtDesc(customerId)
                .stream()
                .map(serviceRequestMapper::toMyServiceRequestResponse)
                .toList();
    }

    @Override
    public CreateServiceRequestResponse cancelServiceRequest(
            UUID requestId,
            CancelServiceRequestRequest request) {

        UUID customerId = authenticationFacade.getCurrentUserId();

        log.info(
                "Cancelling service request. requestId={}, customerId={}",
                requestId,
                customerId
        );

        ServiceRequest serviceRequest =
                serviceRequestRepository
                        .findByIdAndCustomerIdAndIsActiveTrue(
                                requestId,
                                customerId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Service request not found."
                                ));

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

        log.info(
                "Service request cancelled successfully. requestId={}",
                savedRequest.getId()
        );

        return serviceRequestMapper.toResponse(savedRequest);
    }


}