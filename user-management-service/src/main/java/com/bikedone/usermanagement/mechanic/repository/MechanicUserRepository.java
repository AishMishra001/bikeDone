package com.bikedone.usermanagement.mechanic.repository;

import com.bikedone.usermanagement.mechanic.entity.MechanicUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface MechanicUserRepository extends JpaRepository<MechanicUser, UUID> {

    Optional<MechanicUser> findByMobileNumber(String mobileNumber);

    boolean existsByMobileNumber(String mobileNumber);
}
