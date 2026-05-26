package com.rajbhog.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "wallet_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔗 Public transaction reference (for UI / logs / emails)
    @Column(unique = true, nullable = false, length = 50)
    private String transactionRef;

    // 👤 User reference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 💰 Amount of this transaction
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    // CREDIT or DEBIT
    @Column(nullable = false, length = 10)
    private String type; // "CREDIT" / "DEBIT"

    // REFUND / PURCHASE / CASHBACK
    @Column(nullable = false, length = 50)
    private String reference;

    // 🔥 Expiry support
    private LocalDateTime expiryAt;

    @Column(nullable = false)
    private boolean expired;

    // 🔥 FIFO usage tracking
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal usedAmount;
    
    @Column(length = 255)
    private String description;

    // ⏱ Created time
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 🔧 Auto set defaults before insert
    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (usedAmount == null) {
            usedAmount = BigDecimal.ZERO;
        }
        // expired default false already
    }
}