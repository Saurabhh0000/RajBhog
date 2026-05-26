package com.rajbhog.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.rajbhog.enums.PaymentMethod;
import com.rajbhog.enums.PaymentStatus;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PaymentResponse {

    private String orderNumber;
    private String gatewayOrderId; // 🔥 ADD THIS


    private PaymentMethod paymentMethod;

    private PaymentStatus paymentStatus;

    private BigDecimal amount;

    private String transactionId;

    private LocalDateTime createdAt;
}
