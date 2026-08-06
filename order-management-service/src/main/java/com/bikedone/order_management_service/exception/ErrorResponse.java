package com.bikedone.order_management_service.exception;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class ErrorResponse {

    private boolean success;

    private String message;

    private List<String> errors;

    private LocalDateTime timestamp;
}