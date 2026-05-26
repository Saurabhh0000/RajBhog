package com.rajbhog.service.impl;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rajbhog.dto.request.UpdatePaymentStatusRequest;
import com.rajbhog.dto.response.AdminPaymentResponse;
import com.rajbhog.entity.Order;
import com.rajbhog.entity.Payment;
import com.rajbhog.enums.OrderStatus;
import com.rajbhog.enums.PaymentStatus;
import com.rajbhog.exception.OrderException;
import com.rajbhog.repository.OrderRepository;
import com.rajbhog.repository.PaymentRepository;
import com.rajbhog.service.AdminPaymentService;
import com.rajbhog.service.WalletService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminPaymentServiceImpl implements AdminPaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final WalletService walletService;

    @Override
    public List<AdminPaymentResponse> getAllPayments() {

        return paymentRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::map)
                .toList();
    }

    @Override
    public AdminPaymentResponse getPaymentByOrder(String orderNumber) {

        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new OrderException("Order not found"));

        Payment payment = paymentRepository.findByOrder(order)
                .orElseThrow(() -> new OrderException("Payment not found"));

        return map(payment);
    }

    @Override
    public void updatePaymentStatus(String orderNumber, UpdatePaymentStatusRequest request) {

        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new OrderException("Order not found"));

        Payment payment = paymentRepository.findByOrder(order)
                .orElseThrow(() -> new OrderException("Payment not found"));

        PaymentStatus currentStatus = payment.getPaymentStatus();
        PaymentStatus newStatus = request.getPaymentStatus();

        // 🔒 prevent invalid transitions
        if (currentStatus == PaymentStatus.REFUNDED) {
            throw new OrderException("Refunded payment cannot be updated");
        }

        // ===============================
        // 💰 REFUND LOGIC
        // ===============================
        if (newStatus == PaymentStatus.REFUNDED) {

            if (currentStatus != PaymentStatus.PAID) {
                throw new OrderException("Only PAID orders can be refunded");
            }

            if (order.getPaymentStatus() == PaymentStatus.REFUNDED) {
                throw new OrderException("Already refunded");
            }

            BigDecimal refundAmount = payment.getAmount();

            if (refundAmount == null || refundAmount.compareTo(BigDecimal.ZERO) == 0) {
                throw new OrderException("Invalid refund amount");
            }

            walletService.creditWallet(
                    order.getUser(),
                    refundAmount,
                    "REFUND_ORDER_" + order.getOrderNumber()
            );

            if (order.getOrderStatus() == OrderStatus.RETURN_REQUESTED) {
                order.setOrderStatus(OrderStatus.RETURN_APPROVED);
            } else {
                order.setOrderStatus(OrderStatus.CANCELLED);
            }
        }

        // ===============================
        // ✅ NORMAL STATUS UPDATE
        // ===============================
        payment.setPaymentStatus(newStatus);
        order.setPaymentStatus(newStatus);

        if (newStatus == PaymentStatus.PAID) {
            order.setOrderStatus(OrderStatus.CONFIRMED);
        }

        paymentRepository.save(payment);
        orderRepository.save(order);
    }

    // 🔁 Mapper
    private AdminPaymentResponse map(Payment p) {
        return AdminPaymentResponse.builder()
                .orderNumber(p.getOrder().getOrderNumber())
                .paymentMethod(p.getPaymentMethod())
                .paymentStatus(p.getPaymentStatus())
                .amount(p.getAmount())
                .transactionId(p.getTransactionId())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
