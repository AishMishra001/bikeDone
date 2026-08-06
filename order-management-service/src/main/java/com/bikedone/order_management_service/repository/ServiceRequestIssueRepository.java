package com.bikedone.order_management_service.repository;

import com.bikedone.order_management_service.entity.ServiceRequestIssue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ServiceRequestIssueRepository
        extends JpaRepository<ServiceRequestIssue, UUID> {
}