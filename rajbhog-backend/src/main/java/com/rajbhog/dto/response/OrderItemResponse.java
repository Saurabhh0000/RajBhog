package com.rajbhog.dto.response;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OrderItemResponse {
    private Long id; // ✅ THIS IS REQUIRED

    private String productName;
    private String unit;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal totalPrice;
}
