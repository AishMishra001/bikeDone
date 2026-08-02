package com.bikedone.vehicle_management_service.repository;

import com.bikedone.vehicle_management_service.entity.RequestType;
import com.bikedone.vehicle_management_service.entity.ServiceCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceCategoryRepository extends JpaRepository<ServiceCategory, Long> {

    List<ServiceCategory> findByActiveTrueOrderByDisplayNameAsc();

    Optional<ServiceCategory> findByIdAndActiveTrue(Long id);
}