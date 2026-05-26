package com.rajbhog.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.rajbhog.enums.PaymentMethod;
import com.rajbhog.enums.PaymentStatus;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminPaymentResponse {

    private String orderNumber;

    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;

    private BigDecimal amount;

    private String transactionId; // Razorpay / UPI ref

    private LocalDateTime createdAt;
}
