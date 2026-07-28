package com.bikedone.vehicle_management_service.repository;

import com.bikedone.vehicle_management_service.entity.VehicleModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface VehicleModelRepository extends JpaRepository<VehicleModel, UUID> {

    List<VehicleModel> findAllByBrandIdAndIsActiveTrueOrderByModelNameAsc(UUID brandId);

}