package com.rajbhog.service;

import java.math.BigDecimal;
import java.util.List;

import com.rajbhog.entity.Coupon;
import com.rajbhog.entity.User;

public interface CouponService {

	Coupon validateCoupon(String code, BigDecimal orderAmount, User user);

	BigDecimal calculateDiscount(Coupon coupon, BigDecimal orderAmount);
	
	List<Coupon> getAvailableCoupons(User user, BigDecimal cartAmount);
	List<Coupon> getBannerCoupons(User user);


    void recordCouponUsage(User user, Coupon coupon);
}
