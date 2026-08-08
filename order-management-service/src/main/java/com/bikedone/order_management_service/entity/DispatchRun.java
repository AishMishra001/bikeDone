package com.bikedone.order_management_service.entity;

import com.bikedone.order_management_service.enums.DispatchRunStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "dispatch_runs")
public class DispatchRun extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_request_id", nullable = false)
    private ServiceRequest serviceRequest;

    @Column(name = "current_round", nullable = false)
    @Builder.Default
    private Integer currentRound = 1;

    @Column(name = "max_rounds", nullable = false)
    @Builder.Default
    private Integer maxRounds = 10;

    @Column(name = "round_wait_seconds", nullable = false)
    @Builder.Default
    private Integer roundWaitSeconds = 30;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private DispatchRunStatus status = DispatchRunStatus.IN_PROGRESS;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;
}
