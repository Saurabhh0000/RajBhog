package com.rajbhog.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rajbhog.dto.request.UpdateOrderStatusRequest;
import com.rajbhog.dto.response.AdminOrderResponse;
import com.rajbhog.dto.response.OrderEmailDto;
import com.rajbhog.dto.response.OrderItemResponse;
import com.rajbhog.entity.Order;
import com.rajbhog.entity.OrderItem;
import com.rajbhog.enums.OrderStatus;
import com.rajbhog.enums.PaymentStatus;
import com.rajbhog.exception.OrderException;
import com.rajbhog.repository.OrderItemRepository;
import com.rajbhog.repository.OrderRepository;
import com.rajbhog.service.AdminOrderService;
import com.rajbhog.service.EmailService;
import com.rajbhog.service.WalletService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminOrderServiceImpl implements AdminOrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final EmailService emailService;
    private final WalletService walletService;

    @Override
    public List<AdminOrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::map)
                .toList();
    }

    @Override
    public AdminOrderResponse getOrderByOrderNumber(String orderNumber) {

        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new OrderException("Order not found"));

        return map(order);
    }
    @Override
    public void handleReturn(String orderNumber, OrderStatus status) {

        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new OrderException("Order not found"));

        if (order.getOrderStatus() != OrderStatus.RETURN_REQUESTED) {
            throw new OrderException("Invalid return flow");
        }

        if (status == OrderStatus.RETURN_APPROVED) {

            if (order.getPaymentStatus() == PaymentStatus.REFUNDED) {
                throw new OrderException("Already refunded");
            }

            walletService.creditWallet(
                    order.getUser(),
                    order.getRefundAmount() != null
                    ? order.getRefundAmount()
                    : order.getFinalAmount(),
                    "RETURN_REFUND_" + order.getOrderNumber()
            );

            order.setPaymentStatus(PaymentStatus.REFUNDED);
            order.setOrderStatus(OrderStatus.RETURN_APPROVED);
        } else if (status == OrderStatus.RETURN_REJECTED) {

            order.setOrderStatus(OrderStatus.RETURN_REJECTED);
        }

        orderRepository.save(order);
    }

    @Override
    public void updateOrderStatus(String orderNumber, UpdateOrderStatusRequest request) {

        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new OrderException("Order not found"));

        OrderStatus newStatus = request.getOrderStatus();

        // ❌ Cannot change cancelled/delivered orders
        if (order.getOrderStatus() == OrderStatus.CANCELLED ||
            order.getOrderStatus() == OrderStatus.DELIVERED) {
            throw new OrderException("Order status cannot be changed");
        }
        
        if (request.getOrderStatus() == OrderStatus.DELIVERED) {
            order.setDeliveredAt(LocalDateTime.now()); // 🔥 REQUIRED
        }

        order.setOrderStatus(newStatus);
        
     // 🔥 ADD THIS BLOCK
     if (newStatus == OrderStatus.DELIVERED) {

         order.setDeliveredAt(LocalDateTime.now()); // ✅ IMPORTANT

         List<OrderItem> items = orderItemRepository.findByOrder(order);

         OrderEmailDto dto = OrderEmailDto.builder()
                 .orderNumber(order.getOrderNumber())
                 .customerEmail(order.getUser().getEmail())
                 .address(order.getDeliveryAddress())
                 .total(order.getFinalAmount())
                 .subtotal(order.getTotalAmount())
                 .delivery(order.getDeliveryCharge())
                 .discount(order.getDiscount())
                 .items(items.stream().map(i ->
                         OrderEmailDto.Item.builder()
                                 .name(i.getProductName())
                                 .unit(i.getUnit())
                                 .quantity(i.getQuantity())
                                 .price(i.getTotalPrice())
                                 .build()
                 ).toList())
                 .build();

         emailService.sendOrderDeliveredEmail(dto);
     }
     orderRepository.save(order);
    }

    // 🔁 Mapper
    private AdminOrderResponse map(Order order) {

        List<OrderItem> items = orderItemRepository.findByOrder(order);

        return AdminOrderResponse.builder()
                .orderNumber(order.getOrderNumber())
                .customerEmail(order.getUser().getEmail())
                .totalAmount(order.getTotalAmount())
                .deliveryCharge(order.getDeliveryCharge())
                .finalAmount(order.getFinalAmount())
                .cancellationCharge(order.getCancellationCharge())
                .refundAmount(order.getRefundAmount())
                .orderStatus(order.getOrderStatus())
                .paymentStatus(order.getPaymentStatus())
                .deliveryAddress(order.getDeliveryAddress())
                .createdAt(order.getCreatedAt())
                .items(
                        items.stream()
                                .map(i -> OrderItemResponse.builder()
                                        .productName(i.getProductName())
                                        .unit(i.getUnit())
                                        .price(i.getPrice())
                                        .quantity(i.getQuantity())
                                        .totalPrice(i.getTotalPrice())
                                        .build()
                                ).toList()
                )
                .build();
    }
}
