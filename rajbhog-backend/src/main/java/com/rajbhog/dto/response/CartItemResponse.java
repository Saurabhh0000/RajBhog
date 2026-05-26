package com.rajbhog.dto.response;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CartItemResponse {

    private Long id;                 // cartItemId
    private Long productVariantId;
    private String productName;
    private String unit;              // e.g. 1kg, 500g
    private BigDecimal price;         // price per unit
    private Integer quantity;
    private BigDecimal totalPrice;    // price * quantity
}
