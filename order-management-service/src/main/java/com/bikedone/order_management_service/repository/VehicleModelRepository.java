package com.bikedone.order_management_service.repository;

import com.bikedone.order_management_service.entity.VehicleModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
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

    @Query("""
        SELECT vm
        FROM VehicleModel vm
        JOIN FETCH vm.fuelType
        JOIN FETCH vm.transmissionType
        WHERE vm.brand.id = :brandId
        AND (:itemId IS NULL OR vm.item.id = :itemId)
        AND vm.isActive = true
        ORDER BY vm.modelName
     """)
    List<VehicleModel> findActiveModelsByBrandIdAndItemId(UUID brandId, UUID itemId);

    Optional<VehicleModel> findByIdAndIsActiveTrue(UUID id);

}