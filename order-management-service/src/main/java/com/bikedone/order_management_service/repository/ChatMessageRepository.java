package com.bikedone.order_management_service.repository;

import com.bikedone.order_management_service.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {
    List<ChatMessage> findByRequestIdOrderByTimestampAsc(UUID requestId);
}
