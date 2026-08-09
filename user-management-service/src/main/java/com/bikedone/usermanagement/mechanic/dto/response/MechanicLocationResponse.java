package com.bikedone.usermanagement.mechanic.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MechanicLocationResponse {
    private UUID mechanicId;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Boolean isOnline;
    private Boolean isBusy;
}
