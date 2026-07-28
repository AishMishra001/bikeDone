package com.bikedone.vehicle_management_service.repository;

import com.bikedone.vehicle_management_service.entity.VehicleModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface VehicleModelRepository extends JpaRepository<VehicleModel, UUID> {

    @Query("""
        SELECT vm
        FROM VehicleModel vm
        JOIN FETCH vm.fuelType
        JOIN FETCH vm.transmissionType
        WHERE vm.brand.id = :brandId
        AND vm.isActive = true
        ORDER BY vm.modelName
     """)
    List<VehicleModel> findActiveModelsByBrandId(UUID brandId);


}