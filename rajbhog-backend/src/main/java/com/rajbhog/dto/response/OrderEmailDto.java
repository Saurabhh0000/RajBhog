package com.rajbhog.dto.response;

import java.math.BigDecimal;
import java.util.List;

import com.rajbhog.enums.OrderStatus;
import com.rajbhog.enums.PaymentMethod;
import com.rajbhog.enums.PaymentStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderEmailDto {

    private String orderNumber;
    private String customerName;
    private String customerEmail;
    private String transactionId;
    private String address;

    private BigDecimal total;
    private BigDecimal subtotal;
    private BigDecimal delivery;
    private BigDecimal discount;

    private List<Item> items;
    
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private OrderStatus orderStatus;

    @Data
    @Builder
    public static class Item {
        private String name;
        private String unit;
        private int quantity;
        private BigDecimal price;
    }
}
