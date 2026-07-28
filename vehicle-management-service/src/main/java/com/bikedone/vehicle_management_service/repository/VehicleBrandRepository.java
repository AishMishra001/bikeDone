package com.bikedone.vehicle_management_service.repository;

import com.bikedone.vehicle_management_service.entity.VehicleBrand;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VehicleBrandRepository extends JpaRepository<VehicleBrand, UUID> {

    Optional<VehicleBrand> findByBrandCode(String brandCode);

    Optional<VehicleBrand> findByBrandNameIgnoreCase(String brandName);

    boolean existsByBrandCode(String brandCode);

    boolean existsByBrandNameIgnoreCase(String brandName);

    List<VehicleBrand> findAllByIsActiveTrueOrderByBrandNameAsc();

    Optional<VehicleBrand> findByIdAndIsActiveTrue(UUID id);

}