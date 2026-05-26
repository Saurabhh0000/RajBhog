package com.rajbhog.service;

import java.math.BigDecimal;
import java.util.List;

import com.rajbhog.dto.response.WalletResponse;
import com.rajbhog.dto.response.WalletTransactionResponse;
import com.rajbhog.entity.User;

public interface WalletService {

    void creditWallet(User user, BigDecimal amount, String reference);

    void debitWallet(User user, BigDecimal amount);
    
    WalletResponse getMyWallet();

    List<WalletTransactionResponse> getMyTransactions();

    BigDecimal getWalletBalance(User user);
}