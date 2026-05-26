package com.rajbhog.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rajbhog.entity.User;
import com.rajbhog.entity.Wallet;
import com.rajbhog.entity.WalletTransaction;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {

    // 🔥 FIFO: Get usable credits (oldest first)
    List<WalletTransaction> findByUserAndTypeAndExpiredFalseOrderByCreatedAtAsc(
            User user,
            String type
    );

    // 🔥 Expiry job: find transactions to expire
    List<WalletTransaction> findByExpiredFalseAndExpiryAtBefore(
            LocalDateTime now
    );

    // 🔍 All transactions for user (history)
    List<WalletTransaction> findByUserOrderByCreatedAtDesc(User user);
    
}