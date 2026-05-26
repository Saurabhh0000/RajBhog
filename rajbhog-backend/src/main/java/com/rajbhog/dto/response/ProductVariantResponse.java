package com.rajbhog.dto.response;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProductVariantResponse {

    private Long id;
    private String unit;
    private BigDecimal price;
    private Integer stock;
    private Boolean isActive;

    // Product info
    private Long productId;
    private String productName;
}
