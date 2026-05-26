package com.rajbhog.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.rajbhog.entity.Coupon;
import com.rajbhog.entity.CouponUsage;
import com.rajbhog.entity.User;
import com.rajbhog.exception.CouponException;
import com.rajbhog.repository.CouponRepository;
import com.rajbhog.repository.CouponUsageRepository;
import com.rajbhog.repository.OrderRepository;
import com.rajbhog.service.CouponService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;
    private final OrderRepository orderRepository;

    @Override
    public Coupon validateCoupon(String code, BigDecimal orderAmount, User user) {

        Coupon coupon = couponRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new CouponException("Invalid coupon"));

        if (!coupon.getActive())
            throw new CouponException("Coupon inactive");

        if (coupon.getExpiryAt() == null || 
        	    coupon.getExpiryAt().isBefore(LocalDateTime.now()))
            throw new CouponException("Coupon expired");

        if (coupon.getUsedCount() >= coupon.getMaxUsage())
            throw new CouponException("Coupon limit reached");

        if (orderAmount.compareTo(coupon.getMinOrderAmount()) < 0)
            throw new CouponException("Minimum order ₹" + coupon.getMinOrderAmount());

        CouponUsage usage = couponUsageRepository
                .findByUserAndCoupon(user, coupon)
                .orElse(null);

        if (usage != null &&
            usage.getUsageCount() >= coupon.getPerUserLimit()) {
            throw new CouponException("Coupon already used");
        }

        return coupon;
    }

    @Override
    public BigDecimal calculateDiscount(Coupon coupon, BigDecimal orderAmount) {
    	
    	if (coupon.getDiscountValue().compareTo(BigDecimal.ZERO) <= 0) {
    	    throw new CouponException("Invalid discount");
    	}

        return switch (coupon.getDiscountType()) {
            case FLAT -> coupon.getDiscountValue();
            case PERCENT -> orderAmount
                    .multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        };
    }
    

    @Transactional
    @Override
    public void recordCouponUsage(User user, Coupon coupon) {

        couponRepository.incrementUsage(coupon.getId());

        CouponUsage usage = couponUsageRepository
                .findByUserAndCoupon(user, coupon)
                .orElse(
                        CouponUsage.builder()
                                .user(user)
                                .coupon(coupon)
                                .usageCount(0)
                                .build()
                );

        usage.setUsageCount(usage.getUsageCount() + 1);
        couponUsageRepository.save(usage);
    }
    @Override
    public List<Coupon> getBannerCoupons(User user) {

        List<CouponUsage> usages = couponUsageRepository.findByUser(user);

        Map<Long, CouponUsage> usageMap = usages.stream()
                .collect(Collectors.toMap(
                        u -> u.getCoupon().getId(),
                        u -> u
                ));

        return couponRepository.findActiveCoupons().stream()

                // ✅ global usage
                .filter(c -> c.getUsedCount() < c.getMaxUsage())

                // 🔥 FIX: per-user usage check
                .filter(c -> {
                    CouponUsage usage = usageMap.get(c.getId());
                    return usage == null || usage.getUsageCount() < c.getPerUserLimit();
                })

                // ✅ user type
                .filter(c -> matchesUserType(c, user))

                .toList();
    }
    
    @Override
    public List<Coupon> getAvailableCoupons(User user, BigDecimal cartAmount) {

        LocalDateTime now = LocalDateTime.now();
        List<CouponUsage> usages = couponUsageRepository.findByUser(user);
        Map<Long, CouponUsage> usageMap = usages.stream()
                .collect(Collectors.toMap(
                        u -> u.getCoupon().getId(),
                        u -> u
                ));

        return couponRepository.findActiveCoupons().stream()

              
                // ✅ global usage
                .filter(c -> c.getUsedCount() < c.getMaxUsage())

                // 🔥 ADD THIS (per-user limit)
                .filter(c -> {
                    CouponUsage usage = usageMap.get(c.getId());
                    return usage == null || usage.getUsageCount() < c.getPerUserLimit();
                })

                // ✅ min order
                .filter(c -> cartAmount.compareTo(c.getMinOrderAmount()) >= 0)

                // ✅ user type
                .filter(c -> matchesUserType(c, user))

                .toList();
    }
    
    private boolean matchesUserType(Coupon c, User user) {

        long totalOrders = getTotalOrders(user);
        BigDecimal totalSpent = getTotalSpent(user);

        return switch (c.getUserType()) {

            case NEW_USER -> totalOrders == 0;

            case RETURNING -> totalOrders > 0 
            && totalSpent.compareTo(BigDecimal.valueOf(5000)) <= 0;

            case PREMIUM -> totalSpent.compareTo(BigDecimal.valueOf(5000)) > 0;

            case ALL -> true;
        };
    }
    
    private long getTotalOrders(User user) {
        return orderRepository.countByUser(user);
    }

    private BigDecimal getTotalSpent(User user) {
        return orderRepository.sumTotalAmountByUser(user)
                .orElse(BigDecimal.ZERO);
    }

}

