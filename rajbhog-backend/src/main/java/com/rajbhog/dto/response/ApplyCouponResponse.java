package com.rajbhog.dto.response;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ApplyCouponResponse {

    private Long couponId;
    private String code;
    private BigDecimal discount;
    private BigDecimal finalAmount;
    private String message;
}
