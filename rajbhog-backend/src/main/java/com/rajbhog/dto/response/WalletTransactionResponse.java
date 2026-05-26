package com.rajbhog.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WalletTransactionResponse {

    private BigDecimal amount;
    private String type; // CREDIT / DEBIT

    private String reference; // ORDER_123
    private String description;

    private LocalDateTime createdAt;
}
