package com.rajbhog.dto.response;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WalletResponse {
    private BigDecimal balance;
}
