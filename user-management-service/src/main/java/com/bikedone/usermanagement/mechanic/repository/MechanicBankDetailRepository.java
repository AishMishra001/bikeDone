package com.bikedone.usermanagement.mechanic.repository;

import com.bikedone.usermanagement.mechanic.entity.MechanicBankDetail;
import com.bikedone.usermanagement.mechanic.entity.MechanicUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MechanicBankDetailRepository extends JpaRepository<MechanicBankDetail, UUID> {
    Optional<MechanicBankDetail> findByMechanic(MechanicUser mechanic);
    Optional<MechanicBankDetail> findByMechanicId(UUID mechanicId);
}
