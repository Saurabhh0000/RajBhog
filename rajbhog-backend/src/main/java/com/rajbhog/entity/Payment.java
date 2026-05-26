package com.rajbhog.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.rajbhog.enums.PaymentMethod;
import com.rajbhog.enums.PaymentStatus;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "payments",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = "order_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔗 One Order → One Payment (LOCKED RULE)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod; // COD / UPI / CARD / NET_BANKING

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus paymentStatus; // PENDING / PAID / FAILED / REFUNDED

    // Amount user is supposed to pay
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
    
    // Razorpay fields (Phase 2)
    @Column(length = 100)
    private String gatewayOrderId;

    // Optional: gateway transaction id (future use)
    @Column(length = 100)
    private String transactionId;

    // Optional: gateway response message
    @Column(length = 255)
    private String gatewayResponse;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
