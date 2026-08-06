package com.bikedone.order_management_service.repository;

import com.bikedone.order_management_service.entity.ServiceSlot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ServiceSlotRepository extends JpaRepository<ServiceSlot, UUID> {

    List<ServiceSlot> findByIsActiveTrueOrderByStartTimeAsc();

    Optional<ServiceSlot> findByIdAndIsActiveTrue(UUID id);

}