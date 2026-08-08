package com.bikedone.order_management_service.entity;

import com.bikedone.order_management_service.enums.ServiceRequestStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "service_requests")
public class ServiceRequest extends BaseEntity {

    @Column(name = "request_number", nullable = false, unique = true)
    private String requestNumber;

    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @Column(name = "customer_vehicle_id", nullable = false)
    private UUID customerVehicleId;

    @Column(name = "address_id")
    private UUID addressId;

    @Column(name = "current_location_latitude", precision = 10, scale = 8)
    private BigDecimal currentLocationLatitude;

    @Column(name = "current_location_longitude", precision = 11, scale = 8)
    private BigDecimal currentLocationLongitude;

    @Column(name = "current_location_note", length = 1000)
    private String currentLocationNote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_type_id", nullable = false)
    private RequestType requestType;

    @Column(name = "preferred_service_date")
    private LocalDate preferredServiceDate;

    @Column(name = "preferred_service_time")
    private LocalTime preferredServiceTime;

    @Column(name = "is_immediate", nullable = false)
    @Builder.Default
    private Boolean isImmediate = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_slot_id")
    private ServiceSlot serviceSlot;

    @Column(name = "is_issue_identified", nullable = false)
    private Boolean issueIdentified;

    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ServiceRequestStatus status;

    @Column(name = "assigned_mechanic_id")
    private UUID assignedMechanicId;

    @Column(name = "assigned_at")
    private java.time.LocalDateTime assignedAt;

    @Column(name = "current_dispatch_round", nullable = false)
    @Builder.Default
    private Integer currentDispatchRound = 0;

    @Column(name = "cancellation_reason")
    private String cancellationReason;

    /**
     * Comma-separated Cloudinary URLs of images uploaded by the customer.
     * Null if no images were uploaded.
     */
    @Column(name = "image_urls", columnDefinition = "TEXT")
    private String imageUrls;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @OneToMany(
            mappedBy = "serviceRequest",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private List<ServiceRequestIssue> issues = new ArrayList<>();

    @OneToMany(
            mappedBy = "serviceRequest",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private List<ServiceRequestTimeline> timelines = new ArrayList<>();

    public void addIssue(ServiceRequestIssue issue) {

        issues.add(issue);
        issue.setServiceRequest(this);
    }

    public void addTimeline(ServiceRequestTimeline timeline) {

        timelines.add(timeline);
        timeline.setServiceRequest(this);
    }
}
