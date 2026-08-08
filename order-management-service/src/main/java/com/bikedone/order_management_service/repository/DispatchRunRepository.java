package com.bikedone.order_management_service.repository;

import com.bikedone.order_management_service.entity.DispatchRun;
import com.bikedone.order_management_service.enums.DispatchRunStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface DispatchRunRepository extends JpaRepository<DispatchRun, UUID> {

    Optional<DispatchRun> findByServiceRequestIdAndStatus(UUID serviceRequestId, DispatchRunStatus status);

    Optional<DispatchRun> findTopByServiceRequestIdOrderByCreatedAtDesc(UUID serviceRequestId);
}
