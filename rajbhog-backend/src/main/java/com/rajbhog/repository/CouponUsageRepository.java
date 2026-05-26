package com.rajbhog.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rajbhog.entity.Coupon;
import com.rajbhog.entity.CouponUsage;
import com.rajbhog.entity.User;

public interface CouponUsageRepository
extends JpaRepository<CouponUsage, Long> {

Optional<CouponUsage> findByUserAndCoupon(User user, Coupon coupon);

List<CouponUsage> findByUser(User user);
}

