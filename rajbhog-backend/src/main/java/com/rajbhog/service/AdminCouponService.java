package com.rajbhog.service;

import java.util.List;

import com.rajbhog.dto.request.AdminCouponRequest;
import com.rajbhog.dto.response.CouponResponse;

public interface AdminCouponService {

    CouponResponse createCoupon(AdminCouponRequest request);

    CouponResponse updateCoupon(Long couponId, AdminCouponRequest request);

    void toggleCouponStatus(Long couponId);

    List<CouponResponse> getAllCoupons();
}
