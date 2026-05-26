package com.rajbhog.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rajbhog.dto.request.ApplyCouponRequest;
import com.rajbhog.dto.response.ApplyCouponResponse;
import com.rajbhog.entity.Coupon;
import com.rajbhog.entity.User;
import com.rajbhog.service.ApplyCouponService;
import com.rajbhog.service.CouponService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ApplyCouponServiceImpl implements ApplyCouponService {

    private final CouponService couponService;
    
    
    @Transactional
    @Override
    public ApplyCouponResponse applyCoupon(
            ApplyCouponRequest request,
            User user
    ) {

        // 1️⃣ Validate coupon
        Coupon coupon = couponService.validateCoupon(
                request.getCode(),
                request.getOrderAmount(),
                user
        );

        // 2️⃣ Calculate discount
        BigDecimal discount = couponService
                .calculateDiscount(coupon, request.getOrderAmount())
                .setScale(2, RoundingMode.HALF_UP);

        // 3️⃣ Cap discount to order amount
        if (discount.compareTo(request.getOrderAmount()) > 0) {
            discount = request.getOrderAmount();
        }
        // 4️⃣ Final payable amount
        BigDecimal finalAmount = request.getOrderAmount().subtract(discount);
        

        return ApplyCouponResponse.builder()
                .couponId(coupon.getId())
                .code(coupon.getCode())
                .discount(discount)
                .finalAmount(finalAmount)
                .message("Coupon applied successfully")
                .build();
    }
}
