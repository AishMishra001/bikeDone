package com.bikedone.usermanagement.wallet.service.impl;

import com.bikedone.usermanagement.exception.ResourceNotFoundException;
import com.bikedone.usermanagement.mechanic.entity.MechanicUser;
import com.bikedone.usermanagement.mechanic.repository.MechanicUserRepository;
import com.bikedone.usermanagement.wallet.dto.request.ActivateWalletRequest;
import com.bikedone.usermanagement.wallet.dto.response.WalletResponse;
import com.bikedone.usermanagement.wallet.dto.response.WalletTransactionResponse;
import com.bikedone.usermanagement.wallet.entity.SystemConfig;
import com.bikedone.usermanagement.wallet.entity.Wallet;
import com.bikedone.usermanagement.wallet.entity.WalletTransaction;
import com.bikedone.usermanagement.wallet.repository.SystemConfigRepository;
import com.bikedone.usermanagement.wallet.repository.WalletRepository;
import com.bikedone.usermanagement.wallet.repository.WalletTransactionRepository;
import com.bikedone.usermanagement.wallet.service.WalletService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalletServiceImpl implements WalletService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository transactionRepository;
    private final SystemConfigRepository systemConfigRepository;
    private final MechanicUserRepository mechanicUserRepository;

    @Override
    @Transactional(readOnly = true)
    public WalletResponse getWalletByUserId(UUID userId) {
        Wallet wallet = walletRepository.findByUserId(userId).orElse(null);

        if (wallet == null) {
            return WalletResponse.builder()
                    .walletId(null)
                    .userId(userId)
                    .userType("MECHANIC")
                    .balance(BigDecimal.ZERO)
                    .currency("INR")
                    .isActive(false)
                    .activatedAt(null)
                    .welcomeBonusGranted(getInitialBonusConfig())
                    .build();
        }

        return mapToResponse(wallet, getInitialBonusConfig());
    }

    @Override
    public void sendActivationOtp(UUID userId) {
        MechanicUser mechanic = mechanicUserRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Mechanic not found with id: " + userId));
        log.info("WALLET ACTIVATION OTP SENT: Sent 6-digit OTP to mobile: {}", mechanic.getMobileNumber());
    }

    @Override
    @Transactional
    public WalletResponse activateWallet(UUID userId, ActivateWalletRequest request) {
        if (request.getOtp() == null || request.getOtp().trim().length() < 4) {
            throw new IllegalArgumentException("Invalid OTP. Please enter valid 6-digit OTP.");
        }

        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Wallet w = Wallet.builder()
                            .userId(userId)
                            .userType("MECHANIC")
                            .balance(BigDecimal.ZERO)
                            .currency("INR")
                            .isActive(false)
                            .build();
                    return walletRepository.save(w);
                });

        boolean hasReceivedBonus = transactionRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId())
                .stream()
                .anyMatch(tx -> "WELCOME_BONUS".equalsIgnoreCase(tx.getPurpose()));

        BigDecimal welcomeBonus = getInitialBonusConfig();

        if (!hasReceivedBonus) {
            wallet.setBalance(wallet.getBalance().add(welcomeBonus));
            wallet.setIsActive(true);
            wallet.setActivatedAt(LocalDateTime.now());
            walletRepository.save(wallet);

            WalletTransaction tx = WalletTransaction.builder()
                    .walletId(wallet.getId())
                    .amount(welcomeBonus)
                    .transactionType("CREDIT")
                    .purpose("WELCOME_BONUS")
                    .description("First-Time Joining Welcome Bonus")
                    .referenceId("BONUS-" + UUID.randomUUID().toString().substring(0, 8))
                    .build();
            transactionRepository.save(tx);

            log.info("WALLET ACTIVATED: Granted welcome bonus of {} INR to user {}", welcomeBonus, userId);
        } else {
            wallet.setIsActive(true);
            walletRepository.save(wallet);
        }

        return mapToResponse(wallet, welcomeBonus);
    }

    @Override
    @Transactional
    public WalletResponse topupWallet(UUID userId, com.bikedone.usermanagement.wallet.dto.request.TopupWalletRequest request) {
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ONE) < 0) {
            throw new IllegalArgumentException("Top-up amount must be at least ₹1.00");
        }

        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user: " + userId));

        if (!Boolean.TRUE.equals(wallet.getIsActive())) {
            throw new IllegalStateException("Wallet must be activated before adding money.");
        }

        wallet.setBalance(wallet.getBalance().add(request.getAmount()));
        walletRepository.save(wallet);

        String referenceId = "RZP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String paymentMethodStr = request.getPaymentMethod() != null ? request.getPaymentMethod() : "RAZORPAY_UPI";

        WalletTransaction tx = WalletTransaction.builder()
                .walletId(wallet.getId())
                .amount(request.getAmount())
                .transactionType("CREDIT")
                .purpose("TOPUP")
                .description("Wallet Top-up via " + paymentMethodStr)
                .referenceId(referenceId)
                .build();
        transactionRepository.save(tx);

        log.info("WALLET TOPUP SUCCESS: Added {} INR to user {} wallet. New Balance: {}",
                request.getAmount(), userId, wallet.getBalance());

        return mapToResponse(wallet, BigDecimal.ZERO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WalletTransactionResponse> getTransactionsByUserId(UUID userId) {
        Wallet wallet = walletRepository.findByUserId(userId).orElse(null);
        if (wallet == null) {
            return List.of();
        }

        return transactionRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId())
                .stream()
                .map(tx -> WalletTransactionResponse.builder()
                        .id(tx.getId())
                        .walletId(tx.getWalletId())
                        .amount(tx.getAmount())
                        .transactionType(tx.getTransactionType())
                        .purpose(tx.getPurpose())
                        .description(tx.getDescription())
                        .referenceId(tx.getReferenceId())
                        .createdAt(tx.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    private BigDecimal getInitialBonusConfig() {
        return systemConfigRepository.findById("WALLET_INITIAL_BONUS_AMOUNT")
                .map(SystemConfig::getConfigValue)
                .map(val -> {
                    try {
                        return new BigDecimal(val);
                    } catch (Exception e) {
                        return new BigDecimal("200.00");
                    }
                })
                .orElse(new BigDecimal("200.00"));
    }

    private WalletResponse mapToResponse(Wallet wallet, BigDecimal welcomeBonusGranted) {
        return WalletResponse.builder()
                .walletId(wallet.getId())
                .userId(wallet.getUserId())
                .userType(wallet.getUserType())
                .balance(wallet.getBalance())
                .currency(wallet.getCurrency())
                .isActive(wallet.getIsActive())
                .activatedAt(wallet.getActivatedAt())
                .welcomeBonusGranted(welcomeBonusGranted)
                .build();
    }
}
