package com.bikedone.order_management_service.service.sqs;

import com.bikedone.order_management_service.dto.DispatchRetryMessage;
import io.awspring.cloud.sqs.operations.SqsTemplate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class DispatchQueueProducer {

    private final ObjectProvider<SqsTemplate> sqsTemplateProvider;

    @Value("${spring.cloud.aws.sqs.dispatch-queue-name:dev_bike_done_dispatch_queue}")
    private String queueName;

    @Value("${spring.cloud.aws.sqs.enabled:true}")
    private boolean sqsEnabled;

    public void sendDispatchRetryEvent(DispatchRetryMessage message, int delayInSeconds) {
        if (!sqsEnabled) {
            log.warn("AWS SQS is currently disabled (spring.cloud.aws.sqs.enabled=false). Skipping queue message publish.");
            return;
        }

        SqsTemplate sqsTemplate = sqsTemplateProvider.getIfAvailable();
        if (sqsTemplate != null) {
            log.info("Publishing dispatch retry event to SQS queue '{}': requestId={}, round={}, delay={}s",
                    queueName, message.getServiceRequestId(), message.getRoundNumber(), delayInSeconds);

            sqsTemplate.send(to -> to
                    .queue(queueName)
                    .payload(message)
                    .delaySeconds(delayInSeconds)
            );
        } else {
            log.warn("SqsTemplate is not available. Skipping message send for request {}", message.getServiceRequestId());
        }
    }
}
