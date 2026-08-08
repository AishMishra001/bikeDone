package com.bikedone.order_management_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DispatchRetryMessage implements Serializable {

    private UUID serviceRequestId;
    private UUID dispatchRunId;
    private Integer roundNumber;
}
