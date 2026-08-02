package com.bikedone.vehicle_management_service.repository;

import com.bikedone.vehicle_management_service.entity.RequestType;
import com.bikedone.vehicle_management_service.enums.RequestTypeCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RequestTypeRepository
        extends JpaRepository<RequestType, Long> {

    List<RequestType> findByActiveTrueOrderByDisplayNameAsc();

    Optional<RequestType> findByRequestTypeCode(RequestTypeCode code);

    Optional<RequestType> findByIdAndActiveTrue(Long id);

}
