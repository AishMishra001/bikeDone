package com.bikedone.order_management_service.controller;

import com.bikedone.order_management_service.common.response.ApiResponse;
import com.bikedone.order_management_service.dto.request.ServiceabilityPincodeRequest;
import com.bikedone.order_management_service.dto.response.ServiceabilityResponse;
import com.bikedone.order_management_service.dto.response.ServiceabilityResponse.ServiceableZoneDto;
import com.bikedone.order_management_service.entity.ServiceablePincode;
import com.bikedone.order_management_service.service.ServiceabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/serviceability")
@RequiredArgsConstructor
public class ServiceabilityController {

    private final ServiceabilityService serviceabilityService;

    /**
     * Check if a location / pincode / coordinates is serviceable (DB-driven).
     */
    @GetMapping("/check")
    public ResponseEntity<ApiResponse<ServiceabilityResponse>> checkServiceability(
            @RequestParam(required = false) String pincode,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(required = false) String address
    ) {
        ServiceabilityResponse response = serviceabilityService.checkServiceability(pincode, latitude, longitude, address);
        return ResponseEntity.ok(ApiResponse.success(response, response.isServiceable() ? "Location is serviceable." : "Location is outside operational zone."));
    }

    /**
     * Get list of all active serviceable zones and hubs from database.
     */
    @GetMapping("/zones")
    public ResponseEntity<ApiResponse<List<ServiceableZoneDto>>> getActiveZones() {
        List<ServiceableZoneDto> zones = serviceabilityService.getAllActiveZones();
        return ResponseEntity.ok(ApiResponse.success(zones, "Active serviceable zones fetched successfully."));
    }

    /**
     * Admin: Get all configured pincodes (active & inactive).
     */
    @GetMapping("/admin/pincodes")
    public ResponseEntity<ApiResponse<List<ServiceablePincode>>> getAllPincodes() {
        List<ServiceablePincode> all = serviceabilityService.getAllPincodes();
        return ResponseEntity.ok(ApiResponse.success(all, "All configured pincodes fetched successfully."));
    }

    /**
     * Admin: Add or update a serviceable pincode / hub.
     */
    @PostMapping("/admin/pincodes")
    public ResponseEntity<ApiResponse<ServiceablePincode>> addOrUpdatePincode(
            @Valid @RequestBody ServiceabilityPincodeRequest request
    ) {
        ServiceablePincode saved = serviceabilityService.addOrUpdatePincode(request);
        return ResponseEntity.ok(ApiResponse.success(saved, "Serviceable pincode configured successfully."));
    }

    /**
     * Admin: Toggle active/inactive status of a pincode.
     */
    @PatchMapping("/admin/pincodes/{pincode}/toggle")
    public ResponseEntity<ApiResponse<ServiceablePincode>> togglePincode(
            @PathVariable String pincode,
            @RequestParam(required = false) Boolean active
    ) {
        ServiceablePincode updated = serviceabilityService.togglePincodeActive(pincode, active);
        return ResponseEntity.ok(ApiResponse.success(updated, "Pincode status updated successfully."));
    }

    /**
     * Admin: Delete a configured pincode.
     */
    @DeleteMapping("/admin/pincodes/{pincode}")
    public ResponseEntity<ApiResponse<Void>> deletePincode(@PathVariable String pincode) {
        serviceabilityService.deletePincode(pincode);
        return ResponseEntity.ok(ApiResponse.success(null, "Pincode deleted successfully."));
    }
}
