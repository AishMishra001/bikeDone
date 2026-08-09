package com.bikedone.order_management_service.dto.request;

import lombok.Data;

@Data
public class ChatMessageRequest {
    private String senderId;
    private String text;
    private long timestamp;
}
