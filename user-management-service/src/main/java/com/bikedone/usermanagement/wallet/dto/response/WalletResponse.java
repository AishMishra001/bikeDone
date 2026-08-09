package com.bikedone.usermanagement.wallet.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletResponse {
    private UUID walletId;
    private UUID userId;
    private String userType;
    private BigDecimal balance;
    private String currency;
    private Boolean isActive;
    private LocalDateTime activatedAt;
    private BigDecimal welcomeBonusGranted;
}
