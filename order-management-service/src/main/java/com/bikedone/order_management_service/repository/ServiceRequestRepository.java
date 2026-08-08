package com.bikedone.order_management_service.repository;

import com.bikedone.order_management_service.entity.ServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, UUID> {

    boolean existsByRequestNumber(String requestNumber);

    List<ServiceRequest> findByCustomerIdAndIsActiveTrueOrderByCreatedAtDesc(UUID customerId);

    Optional<ServiceRequest> findByIdAndCustomerIdAndIsActiveTrue(UUID id, UUID customerId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query(
        "UPDATE ServiceRequest sr SET sr.status = com.bikedone.order_management_service.enums.ServiceRequestStatus.MECHANIC_ASSIGNED, " +
        "sr.assignedMechanicId = :mechanicId, sr.assignedAt = :assignedAt " +
        "WHERE sr.id = :requestId AND sr.assignedMechanicId IS NULL " +
        "AND (sr.status = com.bikedone.order_management_service.enums.ServiceRequestStatus.REQUEST_CREATED OR sr.status = com.bikedone.order_management_service.enums.ServiceRequestStatus.SEARCHING_MECHANIC)"
    )
    int assignMechanicAtomically(
        @org.springframework.data.repository.query.Param("requestId") UUID requestId,
        @org.springframework.data.repository.query.Param("mechanicId") UUID mechanicId,
        @org.springframework.data.repository.query.Param("assignedAt") java.time.LocalDateTime assignedAt
    );
}