package com.bikedone.vehicle_management_service.repository;

import com.bikedone.vehicle_management_service.entity.ServiceRequestTimeline;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ServiceRequestTimelineRepository
        extends JpaRepository<ServiceRequestTimeline, UUID> {
}