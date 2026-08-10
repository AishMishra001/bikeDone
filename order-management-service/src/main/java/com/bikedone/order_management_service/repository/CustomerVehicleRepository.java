package com.bikedone.order_management_service.repository;

import com.bikedone.order_management_service.entity.CustomerVehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CustomerVehicleRepository extends JpaRepository<CustomerVehicle, UUID> {

    boolean existsByRegistrationNumberIgnoreCaseAndIsActiveTrue(String registrationNumber);

    boolean existsByEngineNumberIgnoreCaseAndIsActiveTrue(String engineNumber);

    boolean existsByChassisNumberIgnoreCaseAndIsActiveTrue(String chassisNumber);

    List<CustomerVehicle> findAllByUserIdAndIsActiveTrue(UUID userId);

    Optional<CustomerVehicle> findByUserIdAndIsDefaultTrueAndIsActiveTrue(UUID userId);

    long countByUserIdAndIsActiveTrue(UUID userId);

    @Query("""
        SELECT cv
        FROM CustomerVehicle cv
        JOIN FETCH cv.brand
        JOIN FETCH cv.model
        WHERE cv.id = :id
    """)
    Optional<CustomerVehicle> findByIdWithAssociations(UUID id);

    @Modifying
    @Query("""
        UPDATE CustomerVehicle cv
        SET cv.isDefault = false
        WHERE cv.userId = :userId
        AND cv.isDefault = true
        AND cv.isActive = true
    """)
    void clearDefaultVehicle(UUID userId);

    List<CustomerVehicle> findByUserIdAndIsActiveTrueOrderByIsDefaultDescCreatedAtDesc(UUID userId);

    Optional<CustomerVehicle> findByIdAndUserIdAndIsActiveTrue(UUID id,UUID userId);

    Optional<CustomerVehicle> findFirstByUserIdAndIsActiveTrueOrderByCreatedAtAsc(UUID userId);
}