package com.rajbhog.dto.response;

import java.math.BigDecimal;

import com.rajbhog.enums.OrderStatus;
import com.rajbhog.enums.PaymentStatus;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PlaceOrderResponse {

    private String orderNumber;
    private BigDecimal totalAmount;
    private BigDecimal deliveryCharge;
    private BigDecimal discount;     // ✅ ADD
    private String couponCode;        // ✅ ADD
    private BigDecimal walletUsed;
    private BigDecimal remainingWalletBalance;
    private BigDecimal finalAmount;
    private OrderStatus orderStatus;
    private PaymentStatus paymentStatus;
}
