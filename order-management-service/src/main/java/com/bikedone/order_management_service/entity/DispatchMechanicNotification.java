package com.bikedone.order_management_service.entity;

import com.bikedone.order_management_service.enums.NotificationStatus;
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
@Table(name = "dispatch_mechanic_notifications")
public class DispatchMechanicNotification extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dispatch_run_id", nullable = false)
    private DispatchRun dispatchRun;

    @Column(name = "service_request_id", nullable = false)
    private UUID serviceRequestId;

    @Column(name = "mechanic_id", nullable = false)
    private UUID mechanicId;

    @Column(name = "round_number", nullable = false)
    private Integer roundNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "notification_status", nullable = false)
    @Builder.Default
    private NotificationStatus notificationStatus = NotificationStatus.NOTIFIED;

    @Column(name = "notified_at", nullable = false)
    private LocalDateTime notifiedAt;

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;
}
