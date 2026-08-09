package com.bikedone.usermanagement.wallet.controller;

import com.bikedone.usermanagement.security.user.UserPrincipal;
import com.bikedone.usermanagement.wallet.dto.request.ActivateWalletRequest;
import com.bikedone.usermanagement.wallet.dto.response.WalletResponse;
import com.bikedone.usermanagement.wallet.dto.response.WalletTransactionResponse;
import com.bikedone.usermanagement.wallet.service.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/wallets")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    private UUID resolveUserId(UserPrincipal principal, UUID userIdParam) {
        if (principal != null && principal.getId() != null) {
            return principal.getId();
        }
        if (userIdParam != null) {
            return userIdParam;
        }
        throw new IllegalArgumentException("User ID is required");
    }

    @GetMapping("/me")
    public ResponseEntity<WalletResponse> getMyWallet(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) UUID userId) {
        UUID targetUserId = resolveUserId(principal, userId);
        WalletResponse wallet = walletService.getWalletByUserId(targetUserId);
        return ResponseEntity.ok(wallet);
    }

    @PostMapping("/send-otp")
    public ResponseEntity<Void> sendActivationOtp(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) UUID userId) {
        UUID targetUserId = resolveUserId(principal, userId);
        walletService.sendActivationOtp(targetUserId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/activate")
    public ResponseEntity<WalletResponse> activateWallet(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) UUID userId,
            @Valid @RequestBody ActivateWalletRequest request) {
        UUID targetUserId = resolveUserId(principal, userId);
        WalletResponse wallet = walletService.activateWallet(targetUserId, request);
        return ResponseEntity.ok(wallet);
    }

    @PostMapping("/topup")
    public ResponseEntity<WalletResponse> topupWallet(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) UUID userId,
            @Valid @RequestBody com.bikedone.usermanagement.wallet.dto.request.TopupWalletRequest request) {
        UUID targetUserId = resolveUserId(principal, userId);
        WalletResponse wallet = walletService.topupWallet(targetUserId, request);
        return ResponseEntity.ok(wallet);
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<WalletTransactionResponse>> getTransactions(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) UUID userId) {
        UUID targetUserId = resolveUserId(principal, userId);
        List<WalletTransactionResponse> transactions = walletService.getTransactionsByUserId(targetUserId);
        return ResponseEntity.ok(transactions);
    }
}
