package com.bikedone.usermanagement.wallet.service;

import com.bikedone.usermanagement.wallet.dto.request.ActivateWalletRequest;
import com.bikedone.usermanagement.wallet.dto.response.WalletResponse;
import com.bikedone.usermanagement.wallet.dto.response.WalletTransactionResponse;

import java.util.List;
import java.util.UUID;

public interface WalletService {

    WalletResponse getWalletByUserId(UUID userId);

    void sendActivationOtp(UUID userId);

    WalletResponse activateWallet(UUID userId, ActivateWalletRequest request);

    WalletResponse topupWallet(UUID userId, com.bikedone.usermanagement.wallet.dto.request.TopupWalletRequest request);

    List<WalletTransactionResponse> getTransactionsByUserId(UUID userId);
}
