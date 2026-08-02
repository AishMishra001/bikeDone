package com.bikedone.vehicle_management_service.repository;

import com.bikedone.vehicle_management_service.entity.ServiceIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceIssueRepository extends JpaRepository<ServiceIssue, Long> {

    List<ServiceIssue> findByServiceCategoryIdAndActiveTrueOrderByDisplayNameAsc(Long categoryId);

    List<ServiceIssue> findAllByIdIn(List<Long> issueIds);

    long countByIdInAndServiceCategoryIdAndActiveTrue(
            List<Long> issueIds,
            Long categoryId
    );

}