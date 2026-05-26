package com.rajbhog.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rajbhog.dto.request.ApplyCouponRequest;
import com.rajbhog.dto.response.ApplyCouponResponse;
import com.rajbhog.dto.response.CouponResponse;
import com.rajbhog.entity.Coupon;
import com.rajbhog.entity.User;
import com.rajbhog.repository.UserRepository;
import com.rajbhog.service.ApplyCouponService;
import com.rajbhog.service.CouponService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user/coupons")
@RequiredArgsConstructor
public class CouponApplyController {

    private final ApplyCouponService applyCouponService;
    private final CouponService couponService;
    private final UserRepository userRepository;

    @PostMapping("/apply")
    public ResponseEntity<ApplyCouponResponse> applyCoupon(
            @Valid @RequestBody ApplyCouponRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(
                applyCouponService.applyCoupon(request, user)
        );
    }
    
    @GetMapping("/available")
    public ResponseEntity<List<CouponResponse>> getAvailableCoupons(
            @RequestParam BigDecimal cartAmount) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow();

        List<CouponResponse> coupons = couponService
                .getAvailableCoupons(user, cartAmount)
                .stream()
                .map(this::map)
                .toList();

        return ResponseEntity.ok(coupons);
    }
    
    @GetMapping("/banners")
    public ResponseEntity<List<CouponResponse>> getBannerCoupons() {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow();

        List<CouponResponse> coupons = couponService
                .getBannerCoupons(user)
                .stream()
                .map(this::map)
                .toList();

        return ResponseEntity.ok(coupons);
    }

    private CouponResponse map(Coupon c) {
        return CouponResponse.builder()
                .id(c.getId())
                .code(c.getCode())
                .discountType(c.getDiscountType())
                .discountValue(c.getDiscountValue())
                .minOrderAmount(c.getMinOrderAmount())
                .expiryAt(c.getExpiryAt())
                .maxUsage(c.getMaxUsage())
                .usedCount(c.getUsedCount())
                .isActive(c.getActive())
                .showBanner(c.getShowBanner())
                .bannerText(c.getBannerText())
                .userType(c.getUserType())
                .build();
    }
}
