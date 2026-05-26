package com.rajbhog.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminProductVariantRequest {

    @NotNull
    private Long productId;

    @NotBlank
    private String unit; // 500g, 1kg, 1L

    @NotNull
    @Min(0)
    private BigDecimal price;

    @NotNull
    @Min(0)
    private Integer stock;

    private Boolean isActive;
}
