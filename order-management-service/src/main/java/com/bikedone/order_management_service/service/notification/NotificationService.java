package com.bikedone.order_management_service.service.notification;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class NotificationService {

    public void notifyMechanics(List<UUID> mechanicIds, UUID serviceRequestId, int roundNumber) {
        log.info("PUSH NOTIFICATION SENT: Notified {} mechanics for service request {} in Round #{}",
                mechanicIds.size(), serviceRequestId, roundNumber);
        // Firebase Cloud Messaging (FCM) push payload dispatch can be hooked here
    }
}
