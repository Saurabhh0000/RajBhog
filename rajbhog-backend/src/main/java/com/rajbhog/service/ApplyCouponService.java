package com.rajbhog.service;

import java.math.BigDecimal;

import com.rajbhog.dto.request.ApplyCouponRequest;
import com.rajbhog.dto.response.ApplyCouponResponse;
import com.rajbhog.entity.User;

public interface ApplyCouponService {

    ApplyCouponResponse applyCoupon(
            ApplyCouponRequest request,
            User user
    );
}
