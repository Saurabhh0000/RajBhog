package com.rajbhog.controller;


import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rajbhog.dto.response.WalletResponse;
import com.rajbhog.dto.response.WalletTransactionResponse;
import com.rajbhog.service.WalletService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    // 🔥 GET WALLET DETAILS
    @GetMapping
    public ResponseEntity<WalletResponse> getWallet() {
        return ResponseEntity.ok(walletService.getMyWallet());
    }

    // 🔥 GET TRANSACTIONS
    @GetMapping("/transactions")
    public ResponseEntity<List<WalletTransactionResponse>> getTransactions() {
        return ResponseEntity.ok(walletService.getMyTransactions());
    }
}