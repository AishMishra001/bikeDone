package com.bikedone.usermanagement.mechanic.repository;

import com.bikedone.usermanagement.mechanic.entity.MechanicServiceEntity;
import com.bikedone.usermanagement.mechanic.entity.MechanicUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MechanicServiceRepository extends JpaRepository<MechanicServiceEntity, UUID> {
    List<MechanicServiceEntity> findByMechanic(MechanicUser mechanic);
    List<MechanicServiceEntity> findByMechanicId(UUID mechanicId);
    void deleteByMechanic(MechanicUser mechanic);
}
