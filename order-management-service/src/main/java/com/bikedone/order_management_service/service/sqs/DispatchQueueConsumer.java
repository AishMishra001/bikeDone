package com.bikedone.order_management_service.service.sqs;

import com.bikedone.order_management_service.dto.DispatchRetryMessage;
import com.bikedone.order_management_service.service.dispatch.DispatchEngineService;
import io.awspring.cloud.sqs.annotation.SqsListener;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "spring.cloud.aws.sqs.enabled", havingValue = "true", matchIfMissing = true)
public class DispatchQueueConsumer {

    private final DispatchEngineService dispatchEngineService;

    @SqsListener("${spring.cloud.aws.sqs.dispatch-queue-name:dev_bike_done_dispatch_queue}")
    public void listenDispatchRetry(DispatchRetryMessage message) {
        log.info("Received SQS dispatch retry message: requestId={}, dispatchRunId={}, round={}",
                message.getServiceRequestId(), message.getDispatchRunId(), message.getRoundNumber());

        try {
            dispatchEngineService.processRetryRound(
                    message.getServiceRequestId(),
                    message.getDispatchRunId(),
                    message.getRoundNumber()
            );
        } catch (Exception e) {
            log.error("Error processing SQS dispatch retry message for requestId={}: {}",
                    message.getServiceRequestId(), e.getMessage(), e);
        }
    }
}
