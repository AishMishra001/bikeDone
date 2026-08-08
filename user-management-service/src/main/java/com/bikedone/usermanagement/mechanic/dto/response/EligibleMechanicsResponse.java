package com.bikedone.usermanagement.mechanic.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EligibleMechanicsResponse {

    private List<UUID> eligibleMechanicIds;
    private Integer count;
}
