package com.bikedone.usermanagement.repository;

import com.bikedone.usermanagement.entity.MobileVerificationOtp;
import com.bikedone.usermanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface MobileVerificationOtpRepository extends JpaRepository<MobileVerificationOtp, UUID> {

    Optional<MobileVerificationOtp> findByUser_Id(UUID userId);

    void deleteByUser_Id(UUID userId);

    Optional<MobileVerificationOtp> findByUser(User user);
}