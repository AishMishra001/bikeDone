package com.bikedone.order_management_service.repository;

import com.bikedone.order_management_service.entity.ServiceablePincode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceablePincodeRepository extends JpaRepository<ServiceablePincode, Long> {

    Optional<ServiceablePincode> findByPincode(String pincode);

    Optional<ServiceablePincode> findByPincodeAndIsActiveTrue(String pincode);

    boolean existsByPincodeAndIsActiveTrue(String pincode);

    List<ServiceablePincode> findAllByIsActiveTrue();
}
