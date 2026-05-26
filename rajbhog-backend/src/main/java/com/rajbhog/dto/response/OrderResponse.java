package com.rajbhog.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.rajbhog.enums.OrderStatus;
import com.rajbhog.enums.PaymentStatus;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OrderResponse {

    private String orderNumber;
    private BigDecimal totalAmount;
    private BigDecimal deliveryCharge;
    private BigDecimal finalAmount;
    
    private BigDecimal discount;      // ✅ ADD
    private String couponCode;         // ✅ ADD

    private BigDecimal cancellationCharge;
    private BigDecimal refundAmount;

    private OrderStatus orderStatus;
    private PaymentStatus paymentStatus;
    
    private String paymentMethod;
    private String transactionId;

    private String deliveryAddress;
    private LocalDateTime createdAt;

    private List<OrderItemResponse> items;
}
