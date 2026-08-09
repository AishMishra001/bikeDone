package com.bikedone.order_management_service.controller;

import com.bikedone.order_management_service.dto.request.ChatMessageRequest;
import com.bikedone.order_management_service.entity.ChatMessage;
import com.bikedone.order_management_service.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/service-requests/{requestId}")
@RequiredArgsConstructor
public class WebSocketChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository chatMessageRepository;

    @PostMapping("/chat")
    public ResponseEntity<?> sendChatMessage(
            @PathVariable UUID requestId,
            @RequestBody ChatMessageRequest request) {
        
        // Save to DB
        ChatMessage chatMessage = ChatMessage.builder()
                .requestId(requestId)
                .senderId(request.getSenderId())
                .text(request.getText())
                .timestamp(request.getTimestamp() == 0 ? System.currentTimeMillis() : request.getTimestamp())
                .build();
        chatMessage = chatMessageRepository.save(chatMessage);
        
        Map<String, Object> messagePayload = new java.util.HashMap<>();
        messagePayload.put("id", chatMessage.getId().toString());
        messagePayload.put("senderId", chatMessage.getSenderId());
        messagePayload.put("text", chatMessage.getText());
        messagePayload.put("timestamp", chatMessage.getTimestamp());

        String destination = "/topic/job-" + requestId.toString();
        messagingTemplate.convertAndSend(destination, messagePayload);
        
        return ResponseEntity.ok(
                com.bikedone.order_management_service.common.response.ApiResponse.success(
                        null,
                        "Message sent via WebSocket"
                )
        );
    }

    @GetMapping("/chat")
    public ResponseEntity<?> getChatHistory(@PathVariable UUID requestId) {
        List<ChatMessage> messages = chatMessageRepository.findByRequestIdOrderByTimestampAsc(requestId);
        
        List<Map<String, Object>> response = messages.stream().map(msg -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", msg.getId().toString());
            map.put("senderId", msg.getSenderId());
            map.put("text", msg.getText());
            map.put("timestamp", msg.getTimestamp());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(
                com.bikedone.order_management_service.common.response.ApiResponse.success(
                        response,
                        "Chat history fetched successfully."
                )
        );
    }

    @PostMapping("/location")
    public ResponseEntity<?> updateLocation(
            @PathVariable UUID requestId,
            @RequestBody com.bikedone.order_management_service.dto.request.LocationUpdateRequest request) {
        
        String destination = "/topic/location-" + requestId.toString();
        messagingTemplate.convertAndSend(destination, request);
        
        return ResponseEntity.ok(
                com.bikedone.order_management_service.common.response.ApiResponse.success(
                        null,
                        "Location sent via WebSocket"
                )
        );
    }
}
