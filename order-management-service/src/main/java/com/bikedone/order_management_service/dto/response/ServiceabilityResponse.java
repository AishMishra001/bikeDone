package com.bikedone.order_management_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceabilityResponse {

    private boolean isServiceable;
    private String pincode;
    private String areaName;
    private String city;
    private String state;
    private String message;
    private List<ServiceableZoneDto> activeZones;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServiceableZoneDto {
        private Long id;
        private String pincode;
        private String areaName;
        private String city;
        private String state;
        private Double latitude;
        private Double longitude;
        private Double radiusKm;
        private Boolean isActive;
    }
}
