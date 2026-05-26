package com.rajbhog.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.rajbhog.enums.DiscountType;
import com.rajbhog.enums.UserType;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CouponResponse {

    private Long id;
    private String code;

    private DiscountType discountType;
    private BigDecimal discountValue;

    private BigDecimal minOrderAmount;
    private LocalDateTime expiryAt;
    
    private Boolean showBanner;
    private String bannerText;
    private UserType userType;

    private Integer maxUsage;
    private Integer usedCount;

    private Boolean isActive;
}
