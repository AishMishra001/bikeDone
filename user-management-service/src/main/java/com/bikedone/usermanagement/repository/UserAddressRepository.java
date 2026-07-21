package com.bikedone.usermanagement.repository;

import com.bikedone.usermanagement.entity.User;
import com.bikedone.usermanagement.entity.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserAddressRepository extends JpaRepository<UserAddress, UUID> {

    List<UserAddress> findByUserAndDeletedFalseOrderByDefaultAddressDescCreatedAtDesc(User user);

    Optional<UserAddress> findByUserAndDefaultAddressTrueAndDeletedFalse(User user);

    Optional<UserAddress> findByIdAndDeletedFalse(UUID id);

    long countByUserAndDeletedFalse(User user);

}