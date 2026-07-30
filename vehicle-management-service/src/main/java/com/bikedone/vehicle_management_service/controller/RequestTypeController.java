package com.bikedone.vehicle_management_service.controller;

import com.bikedone.vehicle_management_service.dto.response.RequestTypeResponse;
import com.bikedone.vehicle_management_service.service.RequestTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/request-types")
@RequiredArgsConstructor
public class RequestTypeController {

    private final RequestTypeService requestTypeService;

    @GetMapping
    public ResponseEntity<List<RequestTypeResponse>> getAllRequestTypes() {
        return ResponseEntity.ok(requestTypeService.getAllRequestTypes());
    }
}