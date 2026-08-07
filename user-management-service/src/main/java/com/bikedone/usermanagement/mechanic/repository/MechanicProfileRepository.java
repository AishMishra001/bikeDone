package com.bikedone.usermanagement.mechanic.repository;

import com.bikedone.usermanagement.mechanic.entity.MechanicProfile;
import com.bikedone.usermanagement.mechanic.entity.MechanicUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MechanicProfileRepository extends JpaRepository<MechanicProfile, UUID> {
    Optional<MechanicProfile> findByMechanic(MechanicUser mechanic);
    Optional<MechanicProfile> findByMechanicId(UUID mechanicId);
}
