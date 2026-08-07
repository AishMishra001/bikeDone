package com.bikedone.usermanagement.mechanic.repository;

import com.bikedone.usermanagement.mechanic.entity.MechanicDocument;
import com.bikedone.usermanagement.mechanic.entity.MechanicUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MechanicDocumentRepository extends JpaRepository<MechanicDocument, UUID> {
    List<MechanicDocument> findByMechanic(MechanicUser mechanic);
    List<MechanicDocument> findByMechanicId(UUID mechanicId);
    Optional<MechanicDocument> findByMechanicAndDocumentType(MechanicUser mechanic, String documentType);
}
