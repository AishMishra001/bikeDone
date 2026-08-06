package com.bikedone.order_management_service.entity;

import com.bikedone.order_management_service.enums.ServiceRequestStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "service_request_timeline")
public class ServiceRequestTimeline extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_request_id", nullable = false)
    private ServiceRequest serviceRequest;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ServiceRequestStatus status;

    @Column(name = "remarks")
    private String remarks;

    @Column(name = "created_by")
    private UUID createdBy;
}