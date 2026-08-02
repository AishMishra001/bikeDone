package com.bikedone.vehicle_management_service.repository;

import com.bikedone.vehicle_management_service.entity.ServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, UUID> {

    boolean existsByRequestNumber(String requestNumber);

    List<ServiceRequest> findByCustomerIdAndIsActiveTrueOrderByCreatedAtDesc(UUID customerId);

    Optional<ServiceRequest> findByIdAndCustomerIdAndIsActiveTrue(UUID id, UUID customerId);

}