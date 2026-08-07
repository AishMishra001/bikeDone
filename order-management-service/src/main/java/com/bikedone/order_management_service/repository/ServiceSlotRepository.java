package com.bikedone.order_management_service.repository;

import com.bikedone.order_management_service.entity.ServiceSlot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.time.LocalTime;

public interface ServiceSlotRepository extends JpaRepository<ServiceSlot, UUID> {

    /** Returns all active slots ordered chronologically. */
    List<ServiceSlot> findByIsActiveTrueOrderBySlotTimeAsc();

    Optional<ServiceSlot> findByIdAndIsActiveTrue(UUID id);

    /** Exact-match lookup: finds the active slot whose slot_time equals the requested time. */
    Optional<ServiceSlot> findFirstByIsActiveTrueAndSlotTime(LocalTime slotTime);
}
