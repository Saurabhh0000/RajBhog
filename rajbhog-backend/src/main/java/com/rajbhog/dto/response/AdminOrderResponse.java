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
public class AdminOrderResponse {

    private String orderNumber;
    private String customerEmail;

    private BigDecimal totalAmount;
    private BigDecimal deliveryCharge;
    private BigDecimal finalAmount;

    private BigDecimal cancellationCharge;
    private BigDecimal refundAmount;

    private OrderStatus orderStatus;
    private PaymentStatus paymentStatus;

    private String deliveryAddress;
    private LocalDateTime createdAt;

    private List<OrderItemResponse> items;
}
