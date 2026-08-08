package com.bikedone.order_management_service.service.sqs;

import com.bikedone.order_management_service.dto.sqs.NotificationEventMessage;
import io.awspring.cloud.sqs.operations.SqsTemplate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "spring.cloud.aws.sqs.enabled", havingValue = "true", matchIfMissing = true)
public class NotificationQueueProducer {

    private final ObjectProvider<SqsTemplate> sqsTemplateProvider;

    @Value("${spring.cloud.aws.sqs.notification-queue-name:dev_bike_done_notification_queue}")
    private String notificationQueueName;

    @Value("${spring.cloud.aws.sqs.enabled:true}")
    private boolean sqsEnabled;

    public void sendNotificationEvent(NotificationEventMessage event) {
        if (!sqsEnabled) {
            log.info("SQS disabled. Skipping notification event send: serviceRequestId={}", event.getServiceRequestId());
            return;
        }

        SqsTemplate sqsTemplate = sqsTemplateProvider.getIfAvailable();
        if (sqsTemplate == null) {
            log.warn("SqsTemplate bean not available. Cannot send notification event for request {}", event.getServiceRequestId());
            return;
        }

        try {
            sqsTemplate.send(to -> to
                    .queue(notificationQueueName)
                    .payload(event)
            );
            log.info("Published notification event to SQS queue '{}': requestId={}, round={}, mechanicsCount={}",
                    notificationQueueName, event.getServiceRequestId(), event.getRoundNumber(), event.getMechanicIds().size());
        } catch (Exception e) {
            log.error("Failed to publish notification event to SQS queue '{}': {}", notificationQueueName, e.getMessage(), e);
        }
    }
}
