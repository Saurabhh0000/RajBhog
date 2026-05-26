package com.rajbhog.scheduler;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.rajbhog.entity.Wallet;
import com.rajbhog.entity.WalletTransaction;
import com.rajbhog.repository.WalletRepository;
import com.rajbhog.repository.WalletTransactionRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class WalletExpiryScheduler {

    private final WalletTransactionRepository walletTransactionRepository;
    private final WalletRepository walletRepository;

    // ⏰ Runs every day at midnight
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void expireWalletBalance() {

        List<WalletTransaction> expiredCredits =
                walletTransactionRepository
                        .findByExpiredFalseAndExpiryAtBefore(LocalDateTime.now());

        for (WalletTransaction tx : expiredCredits) {

            // 🔥 only expire remaining unused amount
            BigDecimal remaining = tx.getAmount().subtract(tx.getUsedAmount());

            if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
                tx.setExpired(true);
                walletTransactionRepository.save(tx);
                continue;
            }

            Wallet wallet = walletRepository.findByUser(tx.getUser())
                    .orElseThrow();

            // deduct only remaining amount
            wallet.setBalance(wallet.getBalance().subtract(remaining));

            tx.setExpired(true);

            walletRepository.save(wallet);
            walletTransactionRepository.save(tx);
        }
    }
}