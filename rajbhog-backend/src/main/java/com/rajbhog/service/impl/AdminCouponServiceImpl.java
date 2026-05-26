package com.rajbhog.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rajbhog.dto.request.AdminCouponRequest;
import com.rajbhog.dto.response.CouponResponse;
import com.rajbhog.entity.Coupon;
import com.rajbhog.enums.UserType;
import com.rajbhog.exception.ResourceNotFoundException;
import com.rajbhog.repository.CouponRepository;
import com.rajbhog.service.AdminCouponService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminCouponServiceImpl implements AdminCouponService {

    private final CouponRepository couponRepository;

    @Override
    public CouponResponse createCoupon(AdminCouponRequest request) {

        if (couponRepository.existsByCodeIgnoreCase(request.getCode())) {
            throw new IllegalArgumentException("Coupon code already exists");
        }

        Coupon coupon = couponRepository.save(
                Coupon.builder()
                        .code(request.getCode().toUpperCase())
                        .discountType(request.getDiscountType())
                        .discountValue(request.getDiscountValue())
                        .minOrderAmount(request.getMinOrderAmount())
                        .expiryAt(request.getExpiryAt())
                        .maxUsage(request.getMaxUsage())
                        .usedCount(0)
                        .perUserLimit(1)
                        .active(
                                request.getIsActive() != null
                                        ? request.getIsActive()
                                        : true
                        )
                        .showBanner(request.getShowBanner() != null ? request.getShowBanner() : false)
                        .bannerText(request.getBannerText())
                        .userType(request.getUserType() != null ? request.getUserType() : UserType.ALL)
                        .build()
        );

        return map(coupon);
    }

    @Override
    public CouponResponse updateCoupon(Long couponId, AdminCouponRequest request) {

        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));

        coupon.setCode(request.getCode().toUpperCase());
        coupon.setDiscountType(request.getDiscountType());
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMinOrderAmount(request.getMinOrderAmount());
        coupon.setExpiryAt(request.getExpiryAt());
        coupon.setMaxUsage(request.getMaxUsage());

        if (request.getIsActive() != null) {
            coupon.setActive(request.getIsActive());
        }
        if (request.getShowBanner() != null) {
            coupon.setShowBanner(request.getShowBanner());
        }

        coupon.setBannerText(request.getBannerText());

        if (request.getUserType() != null) {
            coupon.setUserType(request.getUserType());
        }

        return map(coupon);
    }

    @Override
    public void toggleCouponStatus(Long couponId) {

        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));

        coupon.setActive(!coupon.getActive());
    }

    @Override
    public List<CouponResponse> getAllCoupons() {

        return couponRepository.findAll()
                .stream()
                .map(this::map)
                .toList();
    }

    // 🔁 Mapper
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
