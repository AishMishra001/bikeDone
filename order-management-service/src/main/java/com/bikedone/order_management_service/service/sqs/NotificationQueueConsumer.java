package com.bikedone.order_management_service.service.sqs;

import com.bikedone.order_management_service.dto.sqs.NotificationEventMessage;
import com.bikedone.order_management_service.entity.DispatchMechanicNotification;
import com.bikedone.order_management_service.entity.DispatchRun;
import com.bikedone.order_management_service.enums.NotificationStatus;
import com.bikedone.order_management_service.repository.DispatchMechanicNotificationRepository;
import com.bikedone.order_management_service.repository.DispatchRunRepository;
import com.bikedone.order_management_service.service.notification.NotificationService;
import io.awspring.cloud.sqs.annotation.SqsListener;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "spring.cloud.aws.sqs.enabled", havingValue = "true", matchIfMissing = true)
public class NotificationQueueConsumer {

    private final DispatchMechanicNotificationRepository notificationRepository;
    private final DispatchRunRepository dispatchRunRepository;
    private final NotificationService notificationService;

    @SqsListener("${spring.cloud.aws.sqs.notification-queue-name:dev_bike_done_notification_queue}")
    public void processNotificationEvent(NotificationEventMessage event) {
        log.info("Received SQS Notification event: requestId={}, dispatchRunId={}, round={}, mechanicsCount={}",
                event.getServiceRequestId(), event.getDispatchRunId(), event.getRoundNumber(), event.getMechanicIds().size());

        try {
            DispatchRun dispatchRun = dispatchRunRepository.findById(event.getDispatchRunId()).orElse(null);

            for (UUID mechanicId : event.getMechanicIds()) {
                DispatchMechanicNotification notification = DispatchMechanicNotification.builder()
                        .dispatchRun(dispatchRun)
                        .serviceRequestId(event.getServiceRequestId())
                        .mechanicId(mechanicId)
                        .roundNumber(event.getRoundNumber())
                        .notificationStatus(NotificationStatus.NOTIFIED)
                        .notifiedAt(LocalDateTime.now())
                        .build();
                notificationRepository.save(notification);
            }

            // Trigger Push Notification / FCM Delivery
            notificationService.notifyMechanics(event.getMechanicIds(), event.getServiceRequestId(), event.getRoundNumber());

            log.info("Asynchronously delivered notifications via SQS Queue to {} mechanics for request {}",
                    event.getMechanicIds().size(), event.getServiceRequestId());

        } catch (Exception e) {
            log.error("Failed processing notification SQS event for request {}: {}", event.getServiceRequestId(), e.getMessage(), e);
        }
    }
}
