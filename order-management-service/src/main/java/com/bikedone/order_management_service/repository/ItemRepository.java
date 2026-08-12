package com.bikedone.order_management_service.repository;

import com.bikedone.order_management_service.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ItemRepository extends JpaRepository<Item, UUID> {
    Optional<Item> findByItemCodeAndIsActiveTrue(String itemCode);
    List<Item> findByIsActiveTrue();
}
