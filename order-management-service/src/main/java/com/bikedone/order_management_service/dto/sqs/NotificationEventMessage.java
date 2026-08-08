package com.bikedone.order_management_service.dto.sqs;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEventMessage implements Serializable {

    private UUID serviceRequestId;
    private UUID dispatchRunId;
    private List<UUID> mechanicIds;
    private int roundNumber;
    private long timestamp;
}
