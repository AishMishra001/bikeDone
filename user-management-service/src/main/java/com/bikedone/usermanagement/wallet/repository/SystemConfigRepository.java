package com.bikedone.usermanagement.wallet.repository;

import com.bikedone.usermanagement.wallet.entity.SystemConfig;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SystemConfigRepository extends JpaRepository<SystemConfig, String> {
}
