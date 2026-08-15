package com.bikedone.usermanagement.mechanic.repository;

import com.bikedone.usermanagement.mechanic.entity.MechanicLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MechanicLocationRepository extends JpaRepository<MechanicLocation, UUID> {

    Optional<MechanicLocation> findByMechanicId(UUID mechanicId);

    List<MechanicLocation> findByIsOnlineTrue();

    /**
     * Native Haversine formula query to find online mechanics within radius (in KM)
     */
    @Query(value = "SELECT * FROM mechanic_locations ml " +
            "WHERE ml.is_online = true " +
            "AND (6371 * acos(cos(radians(:latitude)) * cos(radians(ml.latitude)) * " +
            "cos(radians(ml.longitude) - radians(:longitude)) + " +
            "sin(radians(:latitude)) * sin(radians(ml.latitude)))) <= :radiusKm", 
            nativeQuery = true)
    List<MechanicLocation> findOnlineMechanicsNearby(
            @Param("latitude") BigDecimal latitude,
            @Param("longitude") BigDecimal longitude,
            @Param("radiusKm") double radiusKm
    );

    /**
     * Native Haversine formula query to find online & available mechanics within radius (in KM)
     */
    @Query(value = "SELECT ml.mechanic_id FROM mechanic_locations ml " +
            "WHERE ml.is_online = true AND ml.is_busy = false " +
            "AND (6371 * acos(cos(radians(:latitude)) * cos(radians(ml.latitude)) * " +
            "cos(radians(ml.longitude) - radians(:longitude)) + " +
            "sin(radians(:latitude)) * sin(radians(ml.latitude)))) <= :radiusKm", 
            nativeQuery = true)
    List<UUID> findEligibleMechanicsNearby(
            @Param("latitude") BigDecimal latitude,
            @Param("longitude") BigDecimal longitude,
            @Param("radiusKm") double radiusKm
    );
}
