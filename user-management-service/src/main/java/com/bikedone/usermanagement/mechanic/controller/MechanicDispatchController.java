package com.bikedone.usermanagement.mechanic.controller;

import com.bikedone.usermanagement.mechanic.dto.request.EligibleMechanicSearchRequest;
import com.bikedone.usermanagement.mechanic.dto.response.EligibleMechanicsResponse;
import com.bikedone.usermanagement.mechanic.service.MechanicLocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/mechanics")
@RequiredArgsConstructor
public class MechanicDispatchController {

    private final MechanicLocationService mechanicLocationService;

    @PostMapping("/eligible")
    public ResponseEntity<EligibleMechanicsResponse> getEligibleMechanics(
            @Valid @RequestBody EligibleMechanicSearchRequest request) {
        EligibleMechanicsResponse response = mechanicLocationService.findEligibleMechanics(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{mechanicId}/location")
    public ResponseEntity<Void> updateLocation(
            @PathVariable UUID mechanicId,
            @RequestParam BigDecimal latitude,
            @RequestParam BigDecimal longitude,
            @RequestParam(required = false) Boolean isOnline) {
        mechanicLocationService.updateLocation(mechanicId, latitude, longitude, isOnline);
        return ResponseEntity.ok().build();
    }
}
