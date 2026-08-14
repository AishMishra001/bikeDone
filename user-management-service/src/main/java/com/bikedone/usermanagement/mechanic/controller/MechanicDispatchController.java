package com.bikedone.usermanagement.mechanic.controller;

import com.bikedone.usermanagement.mechanic.dto.request.EligibleMechanicSearchRequest;
import com.bikedone.usermanagement.mechanic.dto.response.EligibleMechanicsResponse;
import com.bikedone.usermanagement.mechanic.dto.response.MechanicLocationResponse;
import com.bikedone.usermanagement.mechanic.service.MechanicLocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

import com.bikedone.usermanagement.mechanic.repository.MechanicUserRepository;
import com.bikedone.usermanagement.mechanic.repository.MechanicProfileRepository;
import com.bikedone.usermanagement.mechanic.entity.MechanicUser;
import com.bikedone.usermanagement.mechanic.entity.MechanicProfile;

@RestController
@RequestMapping("/api/v1/mechanics")
@RequiredArgsConstructor
public class MechanicDispatchController {

    private final MechanicLocationService mechanicLocationService;
    private final MechanicUserRepository mechanicUserRepository;
    private final MechanicProfileRepository mechanicProfileRepository;

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

    @GetMapping("/{mechanicId}/location")
    public ResponseEntity<MechanicLocationResponse> getLocation(@PathVariable UUID mechanicId) {
        MechanicLocationResponse response = mechanicLocationService.getLocation(mechanicId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{mechanicId}/profile/public")
    public ResponseEntity<com.bikedone.usermanagement.common.response.ApiResponse<com.bikedone.usermanagement.mechanic.dto.response.PublicMechanicProfileResponse>> getPublicProfile(@PathVariable UUID mechanicId) {
        MechanicUser mechanic = mechanicUserRepository.findById(mechanicId)
            .orElseThrow(() -> new RuntimeException("Mechanic not found"));
        
        MechanicProfile profile = mechanicProfileRepository.findByMechanicId(mechanicId)
            .orElse(null);

        String fullName = profile != null && profile.getFullName() != null 
            ? profile.getFullName() 
            : mechanic.getFirstName() + (mechanic.getLastName() != null ? " " + mechanic.getLastName() : "");
            
        String rawPhotoUrl = profile != null ? profile.getProfilePhotoUrl() : null;
        String photoUrl = (rawPhotoUrl != null && !rawPhotoUrl.trim().isEmpty() && !rawPhotoUrl.startsWith("blob:") && !rawPhotoUrl.startsWith("file:"))
            ? rawPhotoUrl 
            : "https://ui-avatars.com/api/?name=" + fullName.replace(" ", "+") + "&background=f97316&color=fff";

        com.bikedone.usermanagement.mechanic.dto.response.PublicMechanicProfileResponse response = com.bikedone.usermanagement.mechanic.dto.response.PublicMechanicProfileResponse.builder()
                .id(mechanicId)
                .fullName(fullName)
                .mobileNumber(mechanic.getMobileNumber())
                .profilePhotoUrl(photoUrl)
                .rating(4.8) // Hardcoded for now until ratings are implemented
                .build();

        return ResponseEntity.ok(
            com.bikedone.usermanagement.common.response.ApiResponse.<com.bikedone.usermanagement.mechanic.dto.response.PublicMechanicProfileResponse>builder()
                .success(true)
                .data(response)
                .timestamp(java.time.LocalDateTime.now())
                .build()
        );
    }
}

