package com.bikedone.order_management_service.service.dispatch.impl;

import com.bikedone.order_management_service.dto.DispatchRetryMessage;
import com.bikedone.order_management_service.entity.DispatchMechanicNotification;
import com.bikedone.order_management_service.entity.DispatchRun;
import com.bikedone.order_management_service.entity.ServiceRequest;
import com.bikedone.order_management_service.enums.DispatchRunStatus;
import com.bikedone.order_management_service.enums.NotificationStatus;
import com.bikedone.order_management_service.enums.ServiceRequestStatus;
import com.bikedone.order_management_service.repository.DispatchMechanicNotificationRepository;
import com.bikedone.order_management_service.repository.DispatchRunRepository;
import com.bikedone.order_management_service.repository.ServiceRequestRepository;
import com.bikedone.order_management_service.service.client.UmsClientService;
import com.bikedone.order_management_service.service.dispatch.DispatchEngineService;
import com.bikedone.order_management_service.service.notification.NotificationService;
import com.bikedone.order_management_service.service.sqs.DispatchQueueProducer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.bikedone.order_management_service.dto.sqs.NotificationEventMessage;
import com.bikedone.order_management_service.service.sqs.NotificationQueueProducer;

@Slf4j
@Service
@RequiredArgsConstructor
public class DispatchEngineServiceImpl implements DispatchEngineService {

    private final ServiceRequestRepository serviceRequestRepository;
    private final DispatchRunRepository dispatchRunRepository;
    private final DispatchMechanicNotificationRepository notificationRepository;
    private final UmsClientService umsClientService;
    private final NotificationService notificationService;
    private final DispatchQueueProducer queueProducer;
    private final NotificationQueueProducer notificationQueueProducer;

    private static final int DEFAULT_ROUND_WAIT_SECONDS = 30;
    private static final int DEFAULT_MAX_ROUNDS = 10;
    private static final double INITIAL_RADIUS_KM = 5.0;

    @Override
    @Transactional
    public void startDispatch(ServiceRequest serviceRequest) {
        log.info("Starting dispatch engine for service request: {}", serviceRequest.getId());

        serviceRequest.setStatus(ServiceRequestStatus.SEARCHING_MECHANIC);
        serviceRequest.setCurrentDispatchRound(1);
        serviceRequestRepository.save(serviceRequest);

        DispatchRun dispatchRun = DispatchRun.builder()
                .serviceRequest(serviceRequest)
                .currentRound(1)
                .maxRounds(DEFAULT_MAX_ROUNDS)
                .roundWaitSeconds(DEFAULT_ROUND_WAIT_SECONDS)
                .status(DispatchRunStatus.IN_PROGRESS)
                .startedAt(LocalDateTime.now())
                .build();
        dispatchRunRepository.save(dispatchRun);

        executeRound(serviceRequest, dispatchRun, 1, INITIAL_RADIUS_KM);
    }

    @Override
    @Transactional
    public void processRetryRound(UUID serviceRequestId, UUID dispatchRunId, int currentRound) {
        log.info("Processing SQS retry check for requestId={}, dispatchRunId={}, round={}",
                serviceRequestId, dispatchRunId, currentRound);

        ServiceRequest serviceRequest = serviceRequestRepository.findById(serviceRequestId).orElse(null);
        if (serviceRequest == null) {
            log.warn("Service request not found for ID: {}", serviceRequestId);
            return;
        }

        // If request is already assigned or no longer searching, stop retry loop
        if (serviceRequest.getStatus() != ServiceRequestStatus.SEARCHING_MECHANIC &&
            serviceRequest.getStatus() != ServiceRequestStatus.REQUEST_CREATED) {
            log.info("Service request {} status is {}. Terminating dispatch retry loop.",
                    serviceRequestId, serviceRequest.getStatus());
            return;
        }

        DispatchRun dispatchRun = dispatchRunRepository.findById(dispatchRunId).orElse(null);
        if (dispatchRun == null || dispatchRun.getStatus() != DispatchRunStatus.IN_PROGRESS) {
            log.info("Dispatch run {} is not active. Terminating retry loop.", dispatchRunId);
            return;
        }

        if (currentRound >= dispatchRun.getMaxRounds()) {
            log.info("Reached max rounds ({}) for service request {}. Marking as NO_MECHANIC_AVAILABLE.",
                    dispatchRun.getMaxRounds(), serviceRequestId);
            serviceRequest.setStatus(ServiceRequestStatus.NO_MECHANIC_AVAILABLE);
            serviceRequestRepository.save(serviceRequest);

            dispatchRun.setStatus(DispatchRunStatus.EXPIRED);
            dispatchRun.setEndedAt(LocalDateTime.now());
            dispatchRunRepository.save(dispatchRun);
            return;
        }

        int nextRound = currentRound + 1;
        dispatchRun.setCurrentRound(nextRound);
        dispatchRunRepository.save(dispatchRun);

        serviceRequest.setCurrentDispatchRound(nextRound);
        serviceRequestRepository.save(serviceRequest);

        double radiusKm = INITIAL_RADIUS_KM + ((nextRound - 1) * 2.0); // Expand radius each round
        executeRound(serviceRequest, dispatchRun, nextRound, radiusKm);
    }

    @Override
    @Transactional
    public boolean acceptServiceRequest(UUID serviceRequestId, UUID mechanicId) {
        log.info("Mechanic {} attempting atomic accept for request {}", mechanicId, serviceRequestId);
        int rowsUpdated = serviceRequestRepository.assignMechanicAtomically(
                serviceRequestId, mechanicId, LocalDateTime.now());

        if (rowsUpdated > 0) {
            log.info("SUCCESS: Mechanic {} assigned to request {}", mechanicId, serviceRequestId);
            dispatchRunRepository.findByServiceRequestIdAndStatus(serviceRequestId, DispatchRunStatus.IN_PROGRESS)
                    .ifPresent(run -> {
                        run.setStatus(DispatchRunStatus.ACCEPTED);
                        run.setEndedAt(LocalDateTime.now());
                        dispatchRunRepository.save(run);
                    });

            // Mark notifications as ACCEPTED for accepting mechanic and EXPIRED for others
            List<DispatchMechanicNotification> notifs = notificationRepository.findByServiceRequestId(serviceRequestId);
            for (DispatchMechanicNotification n : notifs) {
                if (n.getMechanicId().equals(mechanicId)) {
                    n.setNotificationStatus(com.bikedone.order_management_service.enums.NotificationStatus.ACCEPTED);
                } else {
                    n.setNotificationStatus(com.bikedone.order_management_service.enums.NotificationStatus.EXPIRED);
                }
                n.setRespondedAt(LocalDateTime.now());
            }
            notificationRepository.saveAll(notifs);

            return true;
        } else {
            log.warn("FAILED: Request {} could not be assigned to mechanic {}. (Already assigned or inactive)",
                    serviceRequestId, mechanicId);
            return false;
        }
    }

    private void executeRound(ServiceRequest serviceRequest, DispatchRun dispatchRun, int roundNumber, double radiusKm) {
        List<UUID> eligibleMechanics = umsClientService.fetchEligibleMechanicIds(
                serviceRequest.getCurrentLocationLatitude(),
                serviceRequest.getCurrentLocationLongitude(),
                radiusKm
        );

        log.info("Round #{}: Found {} eligible mechanics within {}km for request {}",
                roundNumber, eligibleMechanics.size(), radiusKm, serviceRequest.getId());

        if (!eligibleMechanics.isEmpty()) {
            NotificationEventMessage notificationEvent = NotificationEventMessage.builder()
                    .serviceRequestId(serviceRequest.getId())
                    .dispatchRunId(dispatchRun.getId())
                    .mechanicIds(eligibleMechanics)
                    .roundNumber(roundNumber)
                    .timestamp(System.currentTimeMillis())
                    .build();

            notificationQueueProducer.sendNotificationEvent(notificationEvent);
        }

        // Schedule next retry evaluation via AWS SQS Message Delay
        DispatchRetryMessage message = DispatchRetryMessage.builder()
                .serviceRequestId(serviceRequest.getId())
                .dispatchRunId(dispatchRun.getId())
                .roundNumber(roundNumber)
                .build();

        queueProducer.sendDispatchRetryEvent(message, dispatchRun.getRoundWaitSeconds());
    }

    @Override
    @Transactional(readOnly = true)
    public com.bikedone.order_management_service.dto.response.PendingJobNotificationResponse getPendingNotificationForMechanic(UUID mechanicId) {
        LocalDateTime sinceTime = LocalDateTime.now().minusMinutes(5);
        List<DispatchMechanicNotification> activeNotifs = notificationRepository.findActivePendingNotifications(mechanicId, sinceTime);

        if (activeNotifs.isEmpty()) {
            return null;
        }

        DispatchMechanicNotification notif = activeNotifs.get(0);
        ServiceRequest sr = serviceRequestRepository.findById(notif.getServiceRequestId()).orElse(null);

        if (sr == null || sr.getStatus() != ServiceRequestStatus.SEARCHING_MECHANIC) {
            return null;
        }

        long elapsedSeconds = java.time.Duration.between(notif.getNotifiedAt(), LocalDateTime.now()).getSeconds();
        if (elapsedSeconds >= 30) {
            return null;
        }
        int remainingSeconds = Math.max(1, 30 - (int) elapsedSeconds);

        return com.bikedone.order_management_service.dto.response.PendingJobNotificationResponse.builder()
                .requestId(sr.getId())
                .customerName("Bike Customer")
                .issueDescription(sr.getDescription() != null ? sr.getDescription() : "Breakdown / Service Request")
                .latitude(sr.getCurrentLocationLatitude())
                .longitude(sr.getCurrentLocationLongitude())
                .addressNote(sr.getCurrentLocationNote())
                .dispatchRound(notif.getRoundNumber())
                .timeoutSeconds(remainingSeconds)
                .build();
    }
}
