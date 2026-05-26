package com.rajbhog.dto.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.rajbhog.enums.DiscountType;
import com.rajbhog.enums.UserType;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminCouponRequest {

    @NotBlank
    private String code;

    @NotNull
    private DiscountType discountType; // FLAT / PERCENT

    @NotNull
    @Min(0)
    private BigDecimal discountValue;

    @NotNull
    @Min(0)
    private BigDecimal minOrderAmount;

    @NotNull
    private LocalDateTime expiryAt;
    
    private Boolean showBanner;
    private String bannerText;
    private UserType userType;

    @NotNull
    @Min(1)
    private Integer maxUsage;

    private Boolean isActive;
}
