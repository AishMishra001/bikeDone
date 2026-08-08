package com.bikedone.order_management_service.service.client;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UmsClientService {

    @Value("${services.ums.base-url:http://localhost:8081}")
    private String umsBaseUrl;

    private final RestClient restClient = RestClient.create();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EligibleMechanicSearchRequest {
        private BigDecimal latitude;
        private BigDecimal longitude;
        private Double radiusKm;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EligibleMechanicsResponse {
        private List<UUID> eligibleMechanicIds;
        private Integer count;
    }

    public List<UUID> fetchEligibleMechanicIds(BigDecimal latitude, BigDecimal longitude, double radiusKm) {
        try {
            EligibleMechanicSearchRequest requestBody = EligibleMechanicSearchRequest.builder()
                    .latitude(latitude)
                    .longitude(longitude)
                    .radiusKm(radiusKm)
                    .build();

            EligibleMechanicsResponse response = restClient.post()
                    .uri(umsBaseUrl + "/api/v1/mechanics/eligible")
                    .body(requestBody)
                    .retrieve()
                    .body(EligibleMechanicsResponse.class);

            if (response != null && response.getEligibleMechanicIds() != null) {
                return response.getEligibleMechanicIds();
            }
        } catch (Exception e) {
            log.error("Failed to fetch eligible mechanics from UMS: {}", e.getMessage());
        }
        return Collections.emptyList();
    }
}
