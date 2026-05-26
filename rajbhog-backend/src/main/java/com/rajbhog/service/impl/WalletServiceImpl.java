package com.rajbhog.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rajbhog.dto.response.WalletResponse;
import com.rajbhog.dto.response.WalletTransactionResponse;
import com.rajbhog.entity.User;
import com.rajbhog.entity.Wallet;
import com.rajbhog.entity.WalletTransaction;
import com.rajbhog.exception.OrderException;
import com.rajbhog.repository.UserRepository;
import com.rajbhog.repository.WalletRepository;
import com.rajbhog.repository.WalletTransactionRepository;
import com.rajbhog.service.WalletService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class WalletServiceImpl implements WalletService {

	private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    
    
    
    @Override
    public WalletResponse getMyWallet() {

        User user = getCurrentUser();

        Wallet wallet = walletRepository.findByUser(user)
                .orElseGet(() -> walletRepository.save(
                        Wallet.builder()
                                .user(user)
                                .balance(BigDecimal.ZERO)
                                .build()
                ));

        return WalletResponse.builder()
                .balance(wallet.getBalance())
                .build();
    }

    @Override
    public List<WalletTransactionResponse> getMyTransactions() {

        User user = getCurrentUser();

        return walletTransactionRepository
                .findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(tx -> WalletTransactionResponse.builder()
                        .amount(tx.getAmount())
                        .type(tx.getType())
                        .reference(tx.getReference())
                        .description(tx.getDescription())
                        .createdAt(tx.getCreatedAt())
                        .build()
                )
                .toList();
    }

    // ============================
    // 💰 CREDIT (Refund / Cashback)
    // ============================
    @Override
    public void creditWallet(User user, BigDecimal amount, String reference) {

        Wallet wallet = walletRepository.findByUser(user)
                .orElseGet(() -> createWallet(user));

        wallet.setBalance(wallet.getBalance().add(amount));
        walletRepository.save(wallet);

        walletTransactionRepository.save(
                WalletTransaction.builder()
                        .transactionRef("WTX-" + UUID.randomUUID().toString().substring(0, 8))
                        .user(user)
                        .amount(amount)
                        .type("CREDIT")
                        .reference(reference)
                        .expiryAt(LocalDateTime.now().plusDays(30)) // 🔥 configurable later
                        .expired(false)
                        .usedAmount(BigDecimal.ZERO)
                        .createdAt(LocalDateTime.now())
                        .build()
        );
    }

    // ============================
    // 🛒 DEBIT (FIFO logic)
    // ============================
    @Override
    public void debitWallet(User user, BigDecimal amount) {

        Wallet wallet = walletRepository.findByUser(user)
                .orElseThrow(() -> new OrderException("Wallet not found"));

        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new OrderException("Insufficient wallet balance");
        }

        BigDecimal remaining = amount;

        // 🔥 FIFO credits
        List<WalletTransaction> credits =
                walletTransactionRepository
                        .findByUserAndTypeAndExpiredFalseOrderByCreatedAtAsc(user, "CREDIT");

        for (WalletTransaction tx : credits) {

            if (remaining.compareTo(BigDecimal.ZERO) <= 0) break;

            BigDecimal available = tx.getAmount().subtract(tx.getUsedAmount());

            if (available.compareTo(BigDecimal.ZERO) <= 0) continue;

            BigDecimal toUse = available.min(remaining);

            tx.setUsedAmount(tx.getUsedAmount().add(toUse));
            walletTransactionRepository.save(tx);

            remaining = remaining.subtract(toUse);
        }

        wallet.setBalance(wallet.getBalance().subtract(amount));
        walletRepository.save(wallet);

        // 🔥 record debit transaction
        walletTransactionRepository.save(
                WalletTransaction.builder()
                        .transactionRef("WTX-" + UUID.randomUUID().toString().substring(0, 8))
                        .user(user)
                        .amount(amount)
                        .type("DEBIT")
                        .reference("PURCHASE")
                        .expired(false)
                        .usedAmount(BigDecimal.ZERO)
                        .createdAt(LocalDateTime.now())
                        .build()
        );
    }

    // ============================
    // 📊 GET BALANCE
    // ============================
    @Override
    public BigDecimal getWalletBalance(User user) {
        return walletRepository.findByUser(user)
                .map(Wallet::getBalance)
                .orElse(BigDecimal.ZERO);
    }

    // ============================
    // 🔧 HELPER
    // ============================
    private Wallet createWallet(User user) {
        Wallet wallet = Wallet.builder()
                .user(user)
                .balance(BigDecimal.ZERO)
                .build();
        return walletRepository.save(wallet);
    }
    
    private User getCurrentUser() {
        String email = org.springframework.security.core.context.SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}