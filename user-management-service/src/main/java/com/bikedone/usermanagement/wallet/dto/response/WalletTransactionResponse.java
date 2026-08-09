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
public class WalletTransactionResponse {
    private UUID id;
    private UUID walletId;
    private BigDecimal amount;
    private String transactionType;
    private String purpose;
    private String description;
    private String referenceId;
    private LocalDateTime createdAt;
}
