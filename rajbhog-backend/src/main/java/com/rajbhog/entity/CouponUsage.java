package com.rajbhog.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "coupon_usage",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "coupon_id"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coupon_id", nullable = false)
    private Coupon coupon;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer usageCount;
}
