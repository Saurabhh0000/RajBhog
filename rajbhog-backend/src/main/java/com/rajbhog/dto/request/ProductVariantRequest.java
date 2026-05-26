package com.rajbhog.dto.request;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductVariantRequest {

    private Long productId;

    private String unit;

    private BigDecimal price;

    private Integer stock;

    private Boolean isActive;
}
