package com.bikedone.usermanagement.mechanic.repository;

import com.bikedone.usermanagement.mechanic.entity.MechanicOtp;
import com.bikedone.usermanagement.mechanic.entity.MechanicUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface MechanicOtpRepository extends JpaRepository<MechanicOtp, UUID> {

    Optional<MechanicOtp> findByMechanic(MechanicUser mechanic);

    Optional<MechanicOtp> findByMechanic_Id(UUID mechanicId);

    void deleteByMechanic_Id(UUID mechanicId);
}
