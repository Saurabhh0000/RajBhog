package com.rajbhog.service.impl;

import java.math.BigDecimal;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rajbhog.dto.request.CreatePaymentRequest;
import com.rajbhog.dto.response.OrderEmailDto;
import com.rajbhog.dto.response.PaymentResponse;
import com.rajbhog.entity.Order;
import com.rajbhog.entity.Payment;
import com.rajbhog.entity.User;
import com.rajbhog.enums.OrderStatus;
import com.rajbhog.enums.PaymentMethod;
import com.rajbhog.enums.PaymentStatus;
import com.rajbhog.enums.Role;
import com.rajbhog.exception.OrderException;
import com.rajbhog.repository.OrderRepository;
import com.rajbhog.repository.PaymentRepository;
import com.rajbhog.repository.UserRepository;
import com.rajbhog.service.CouponService;
import com.rajbhog.service.EmailService;
import com.rajbhog.service.PaymentService;
import com.rajbhog.service.WalletService;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final CouponService couponService;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final RazorpayClient razorpayClient;
    
    @Value("${razorpay.key-secret}")
    private String razorpaySecret;


    // ---------------- PHASE 1 ----------------

    @Override
    public PaymentResponse createPayment(String orderNumber, CreatePaymentRequest request) {

        User user = getCurrentUser();

        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new OrderException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new OrderException("Access denied");
        }

        if (paymentRepository.existsByOrder(order)) {
            throw new OrderException("Payment already exists");
        }
     // ✅ ONLINE vs COD handling
        if (request.getPaymentMethod() != PaymentMethod.COD) {
            order.setOrderStatus(OrderStatus.CONFIRMED); // 🔥 ONLINE → CONFIRMED
        } else {
            order.setOrderStatus(OrderStatus.PLACED); // COD → PLACED
        }
        order.setPaymentMethod(request.getPaymentMethod());
        orderRepository.save(order);
        Payment payment = paymentRepository.save(
                Payment.builder()
                        .order(order)
                        .paymentMethod(request.getPaymentMethod())
                        .paymentStatus(PaymentStatus.PENDING)
                        .amount(order.getFinalAmount())
                        .build()
        );
        
     // 🔥 FORCE LOAD ITEMS
        order.getItems().size();
     // 🔥 SEND EMAIL FOR COD
        if (request.getPaymentMethod() == PaymentMethod.COD) {

            // ✅ BUILD DTO
            OrderEmailDto dto = OrderEmailDto.builder()
                    .orderNumber(order.getOrderNumber())
                    .customerName(order.getUser().getFullName())
                    .customerEmail(order.getUser().getEmail())
                    .transactionId("N/A")
                    .address(order.getDeliveryAddress())
                    .total(order.getFinalAmount())
                    .subtotal(order.getTotalAmount())
                    .delivery(order.getDeliveryCharge())
                    .discount(order.getDiscount())
                    .paymentMethod(order.getPaymentMethod()) 
                    .paymentStatus(order.getPaymentStatus())
                    .orderStatus(order.getOrderStatus())
                    .items(order.getItems().stream().map(i ->
                            OrderEmailDto.Item.builder()
                                    .name(i.getProductVariant().getProduct().getName())
                                    .unit(i.getUnit())
                                    .quantity(i.getQuantity())
                                    .price(i.getTotalPrice())
                                    .build()
                    ).toList())
                    .build();

            // ✅ SEND EMAIL
            emailService.sendOrderPlacedEmail(dto);

       
        }

        return map(payment);
    }

    @Override
    public PaymentResponse getPaymentByOrder(String orderNumber) {

        User user = getCurrentUser();

        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new OrderException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new OrderException("Access denied");
        }

        Payment payment = paymentRepository.findByOrder(order)
                .orElseThrow(() -> new OrderException("Payment not found"));

        return map(payment);
    }

    @Override
    public void markPaymentAsPaid(String orderNumber) {

        User admin = getCurrentUser();
        if (admin.getRole() != Role.ADMIN) {
            throw new OrderException("Admin only");
        }

        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new OrderException("Order not found"));

        Payment payment = paymentRepository.findByOrder(order)
                .orElseThrow(() -> new OrderException("Payment not found"));

        payment.setPaymentStatus(PaymentStatus.PAID);

        order.setPaymentStatus(PaymentStatus.PAID); // 🔥 ADD
        order.setOrderStatus(OrderStatus.CONFIRMED);
        paymentRepository.save(payment);
        orderRepository.save(order);
        if (order.getCoupon() != null) {
            couponService.recordCouponUsage(order.getUser(), order.getCoupon());
        }
    }

    // ---------------- PHASE 2 ----------------

    @Override
    public PaymentResponse createRazorpayOrder(String orderNumber) {

        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new OrderException("Order not found"));

        Payment payment = paymentRepository.findByOrder(order)
                .orElseThrow(() -> new OrderException("Payment not created"));

        try {
            JSONObject options = new JSONObject();
            options.put("amount", payment.getAmount().multiply(BigDecimal.valueOf(100)).longValue());
            options.put("currency", "INR");
            options.put("receipt", order.getOrderNumber());

            com.razorpay.Order rpOrder = razorpayClient.orders.create(options);

            payment.setGatewayOrderId(rpOrder.get("id"));
            return map(payment);

        } catch (Exception e) {
            e.printStackTrace(); // 🔥 ADD THIS

            throw new OrderException("Razorpay order creation failed");
        }
    }


@Override
public void verifyRazorpayPayment(
        String razorpayOrderId,
        String razorpayPaymentId,
        String razorpaySignature) {

    try {
        // 🔐 Prepare payload
        JSONObject options = new JSONObject();
        options.put("razorpay_order_id", razorpayOrderId);
        options.put("razorpay_payment_id", razorpayPaymentId);
        options.put("razorpay_signature", razorpaySignature);

        // ✅ OFFICIAL verification
        boolean isValid = Utils.verifyPaymentSignature(options, razorpaySecret);

        if (!isValid) {
            throw new OrderException("Invalid Razorpay signature");
        }

        Payment payment = paymentRepository
                .findByGatewayOrderId(razorpayOrderId)
                .orElseThrow(() -> new OrderException("Payment not found"));
        

        payment.setPaymentStatus(PaymentStatus.PAID);
        payment.setTransactionId(razorpayPaymentId);
        
     
        
        Order order = payment.getOrder();
        order.setPaymentStatus(PaymentStatus.PAID); // if you have this field
        order.setOrderStatus(OrderStatus.CONFIRMED);
        
        order.setPaymentMethod(payment.getPaymentMethod());
     // 🔥 FORCE LOAD ITEMS (VERY IMPORTANT)
        order.getItems().size();
        // 🔥 SEND EMAIL AFTER SUCCESS
        OrderEmailDto dto = OrderEmailDto.builder()
                .orderNumber(order.getOrderNumber())
                .customerName(order.getUser().getFullName())
                .customerEmail(order.getUser().getEmail())
                .transactionId(payment.getTransactionId())
                .address(order.getDeliveryAddress())
                .total(order.getFinalAmount())
                .subtotal(order.getTotalAmount())
                .delivery(order.getDeliveryCharge())
                .discount(order.getDiscount())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .orderStatus(order.getOrderStatus()) 

                .items(order.getItems().stream().map(i ->
                        OrderEmailDto.Item.builder()
                                .name(i.getProductVariant().getProduct().getName())
                                .unit(i.getUnit())
                                .quantity(i.getQuantity())
                                .price(i.getTotalPrice())
                                .build()
                ).toList())
                .build();

        emailService.sendOrderPlacedEmail(dto);
        
        paymentRepository.save(payment);
        orderRepository.save(order);
        
        if (order.getCoupon() != null) {
            couponService.recordCouponUsage(order.getUser(), order.getCoupon());
        }

    } catch (Exception e) {
    	e.printStackTrace();
        throw new OrderException("Payment verification failed");
    }
}

    // ---------------- HELPERS ----------------

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new OrderException("User not found"));
    }

    private PaymentResponse map(Payment payment) {
        return PaymentResponse.builder()
                .orderNumber(payment.getOrder().getOrderNumber())
                .paymentMethod(payment.getPaymentMethod())
                .paymentStatus(payment.getPaymentStatus())
                .amount(payment.getAmount())
                .transactionId(payment.getTransactionId())
                .createdAt(payment.getCreatedAt())
                .gatewayOrderId(payment.getGatewayOrderId()) // 🔥 ADD THIS
                .build();
    }
}
