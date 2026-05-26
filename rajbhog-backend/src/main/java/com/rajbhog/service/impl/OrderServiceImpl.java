package com.rajbhog.service.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.rajbhog.dto.response.OrderItemResponse;
import com.rajbhog.dto.response.OrderResponse;
import com.rajbhog.dto.response.PlaceOrderResponse;
import com.rajbhog.entity.Cart;
import com.rajbhog.entity.CartItem;
import com.rajbhog.entity.Coupon;
import com.rajbhog.entity.Order;
import com.rajbhog.entity.OrderItem;
import com.rajbhog.entity.Payment;
import com.rajbhog.entity.ProductVariant;
import com.rajbhog.entity.User;
import com.rajbhog.entity.UserAddress;
import com.rajbhog.enums.OrderStatus;
import com.rajbhog.enums.PaymentMethod;
import com.rajbhog.enums.PaymentStatus;
import com.rajbhog.exception.OrderException;
import com.rajbhog.repository.CartItemRepository;
import com.rajbhog.repository.CartRepository;
import com.rajbhog.repository.OrderItemRepository;
import com.rajbhog.repository.OrderRepository;
import com.rajbhog.repository.PaymentRepository;
import com.rajbhog.repository.ProductVariantRepository;
import com.rajbhog.repository.UserAddressRepository;
import com.rajbhog.repository.UserRepository;
import com.rajbhog.service.CouponService;
import com.rajbhog.service.DeliveryRadiusService;
import com.rajbhog.service.EmailService;
import com.rajbhog.service.OrderService;
import com.rajbhog.service.WalletService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

	private final UserRepository userRepository;
	private final CartRepository cartRepository;
	private final CartItemRepository cartItemRepository;
	private final UserAddressRepository userAddressRepository;
	private final OrderRepository orderRepository;
	private final OrderItemRepository orderItemRepository;
	private final DeliveryRadiusService deliveryRadiusService;
	private final CouponService couponService;
	private final EmailService emailService;
	private final WalletService walletService;
	private final PaymentRepository paymentRepository;
	
	private final ProductVariantRepository productVariantRepository;

	private static final BigDecimal CANCEL_PERCENT_CONFIRMED = BigDecimal.valueOf(0.10); // 10%

	@Override
	public PlaceOrderResponse placeOrder(String couponCode, boolean useWallet) {
		
		BigDecimal walletUsed = BigDecimal.ZERO;

	    User user = getCurrentUser();

	    Cart cart = cartRepository.findByUser(user)
	            .orElseGet(() ->
	                    cartRepository.save(Cart.builder().user(user).build())
	            );

	    List<CartItem> cartItems = cartItemRepository.findByCart(cart);
	    if (cartItems.isEmpty()) {
	        throw new OrderException("Cart is empty");
	    }

	    UserAddress address = userAddressRepository
	            .findByUserAndIsDefaultTrue(user)
	            .orElseThrow(() -> new OrderException("No default address found"));

	    deliveryRadiusService.validateDeliveryAddress(address);

	    // 🔴 STOCK + ACTIVE VALIDATION
	    for (CartItem ci : cartItems) {
	        ProductVariant v = ci.getVariant();

	        if (!v.getIsActive()) {
	            throw new OrderException("Product variant unavailable");
	        }

	        if (v.getStock() < ci.getQuantity()) {
	            throw new OrderException(
	                "Insufficient stock for " +
	                v.getProduct().getName() + " (" + v.getUnit() + ")"
	            );
	        }
	    }

	    BigDecimal totalAmount = cartItems.stream()
	            .map(ci -> ci.getVariant().getPrice()
	                    .multiply(BigDecimal.valueOf(ci.getQuantity())))
	            .reduce(BigDecimal.ZERO, BigDecimal::add);

	    BigDecimal deliveryCharge = BigDecimal.ZERO;

	    Coupon coupon = null;
	    BigDecimal discount = BigDecimal.ZERO;

	    if (couponCode != null && !couponCode.isBlank()) {
	        coupon = couponService.validateCoupon(couponCode, totalAmount, user);

	        discount = couponService.calculateDiscount(coupon, totalAmount);

	        // ✅ CAP discount
	        if (discount.compareTo(totalAmount) > 0) {
	            discount = totalAmount;
	        }
	    }


	    BigDecimal finalAmount =
	            totalAmount.add(deliveryCharge).subtract(discount).max(BigDecimal.ZERO);
	    
	 // ===============================
	 // 💰 WALLET LOGIC
	 // ===============================
	    if (useWallet) {

	        BigDecimal walletBalance = walletService.getWalletBalance(user);

	        if (walletBalance.compareTo(BigDecimal.ZERO) > 0) {

	            if (walletBalance.compareTo(finalAmount) >= 0) {
	                // FULL WALLET

	                walletUsed = finalAmount;

	                walletService.debitWallet(user, finalAmount);

	                finalAmount = BigDecimal.ZERO;

	            } else {
	                // PARTIAL WALLET

	                walletUsed = walletBalance;

	                walletService.debitWallet(user, walletBalance);

	                finalAmount = finalAmount.subtract(walletBalance);
	            }
	        }
	    }

	    Order order = orderRepository.save(
	            Order.builder()
	                    .orderNumber(generateOrderNumber())
	                    .user(user)
	                    .coupon(coupon)
	                    .totalAmount(totalAmount)
	                    .deliveryCharge(deliveryCharge)
	                    .discount(discount)
	                    .finalAmount(finalAmount)
	                    .cancellationCharge(BigDecimal.ZERO) // ✅ FIX
	                    .refundAmount(BigDecimal.ZERO)       // ✅ FIX
	                    .paymentMethod(
	                    	    finalAmount.compareTo(BigDecimal.ZERO) == 0
	                    	        ? PaymentMethod.WALLET
	                    	        : PaymentMethod.COD   // default for now
	                    	)
	                    .paymentStatus(
	                    	    finalAmount.compareTo(BigDecimal.ZERO) == 0
	                    	        ? PaymentStatus.PAID
	                    	        : PaymentStatus.PENDING
	                    	)
	                    	.orderStatus(
	                    	    finalAmount.compareTo(BigDecimal.ZERO) == 0
	                    	        ? OrderStatus.CONFIRMED
	                    	        : OrderStatus.PLACED
	                    	)
	                    .deliveryAddress(formatAddress(address))
	                    .build()
	    );


	    List<OrderItem> orderItems = cartItems.stream().map(ci -> {
	        ProductVariant v = ci.getVariant();
	        BigDecimal price = v.getPrice();
	        int qty = ci.getQuantity();

	        return OrderItem.builder()
	                .order(order)
	                .productVariant(v)
	                .productName(v.getProduct().getName())
	                .unit(v.getUnit())
	                .price(price)
	                .quantity(qty)
	                .totalPrice(price.multiply(BigDecimal.valueOf(qty)))
	                .build();
	    }).toList();

	    orderItemRepository.saveAll(orderItems);

	    // 🔴 STOCK DEDUCTION
	    for (CartItem ci : cartItems) {
	        ProductVariant v = ci.getVariant();
	        v.setStock(v.getStock() - ci.getQuantity());
	    }
	    productVariantRepository.saveAll(
	    	    cartItems.stream()
	    	        .map(CartItem::getVariant)
	    	        .toList()
	    	);


	    cartItemRepository.deleteAll(cartItems);
	 // 🔥 HANDLE FULL WALLET PAYMENT (NO ONLINE PAYMENT NEEDED)
	    if (finalAmount.compareTo(BigDecimal.ZERO) == 0) {
	        paymentRepository.save(
	            Payment.builder()
	                .order(order)
	                .amount(BigDecimal.ZERO)
	                .paymentStatus(PaymentStatus.PAID)
	                .paymentMethod(PaymentMethod.WALLET) // 🔥 add this enum
	                .transactionId("WALLET-" + order.getOrderNumber())
	                .build()
	        );
	        
	        order.setPaymentStatus(PaymentStatus.PAID);
	    }
	    BigDecimal remainingWallet = walletService.getWalletBalance(user);


	    return PlaceOrderResponse.builder()
	            .orderNumber(order.getOrderNumber())
	            .totalAmount(totalAmount)
	            .deliveryCharge(deliveryCharge)
	            .discount(discount) // ✅
	            .couponCode(coupon != null ? coupon.getCode() : null) // ✅
	            .walletUsed(walletUsed)
            	.remainingWalletBalance(remainingWallet)
	            .finalAmount(finalAmount)
	            .orderStatus(order.getOrderStatus())
	            .paymentStatus(order.getPaymentStatus())
	            .build();
	}


	@Override
	public void cancelOrder(String orderNumber) {

		User user = getCurrentUser();

		Order order = orderRepository.findByOrderNumber(orderNumber)
				.orElseThrow(() -> new OrderException("Order not found"));

		if (!order.getUser().getId().equals(user.getId())) {
			throw new OrderException("You cannot cancel this order");
		}

		if (order.getOrderStatus() == OrderStatus.CANCELLED) {
			throw new OrderException("Order already cancelled");
		}

		if (order.getOrderStatus() == OrderStatus.PACKED || order.getOrderStatus() == OrderStatus.OUT_FOR_DELIVERY
				|| order.getOrderStatus() == OrderStatus.DELIVERED) {

			throw new OrderException("Order cannot be cancelled now");
		}

		BigDecimal cancellationCharge = BigDecimal.ZERO;

		if (order.getOrderStatus() == OrderStatus.CONFIRMED) {
			cancellationCharge = order.getFinalAmount().multiply(CANCEL_PERCENT_CONFIRMED);
		}

		BigDecimal refundAmount = order.getFinalAmount().subtract(cancellationCharge);

		order.setOrderStatus(OrderStatus.CANCELLED);
		order.setCancellationCharge(cancellationCharge);
		order.setRefundAmount(refundAmount);

		if (order.getPaymentStatus() == PaymentStatus.PAID) {

		    walletService.creditWallet(
		        order.getUser(),
		        refundAmount,
		        "CANCEL_REFUND_" + order.getOrderNumber()
		    );

		    order.setPaymentStatus(PaymentStatus.REFUNDED);
		}

		orderRepository.save(order);
	}

	@Override
	public List<OrderResponse> getMyOrders() {

		User user = getCurrentUser();

		return orderRepository.findByUserOrderByCreatedAtDesc(user).stream().map(order -> map(order)).toList();
	}

	@Override
	public OrderResponse getOrderByOrderNumber(String orderNumber) {

		Order order = orderRepository.findByOrderNumber(orderNumber)
				.orElseThrow(() -> new OrderException("Order not found"));

		return map(order);
	}
	
	@Override
	public void requestReturn(String orderNumber, String reason) {

	    User user = getCurrentUser();

	    Order order = orderRepository.findByOrderNumber(orderNumber)
	            .orElseThrow(() -> new OrderException("Order not found"));

	    if (!order.getUser().getId().equals(user.getId())) {
	        throw new OrderException("Access denied");
	    }

	    if (order.getOrderStatus() != OrderStatus.DELIVERED) {
	        throw new OrderException("Return allowed only after delivery");
	        
	    }
	    
	 // ⏰ RETURN WINDOW CHECK (same-day)
	    if (order.getDeliveredAt() == null) {
	        throw new OrderException("Delivery time not found");
	    }

	    if (!order.getDeliveredAt().toLocalDate().equals(LocalDate.now())) {
	        throw new OrderException("Return allowed only on same day of delivery");
	    }

	    if (order.getOrderStatus() == OrderStatus.RETURN_REQUESTED) {
	        throw new OrderException("Return already requested");
	    }

	    order.setOrderStatus(OrderStatus.RETURN_REQUESTED);
	    order.setReturnReason(reason);
	    order.setReturnRequestedAt(LocalDateTime.now());

	    orderRepository.save(order);
	}
	
	@Override
	public Order getByOrderNumber(String orderNumber) {

	    User user = getCurrentUser(); // 🔥 ADD

	    Order order = orderRepository.findByOrderNumber(orderNumber)
	            .orElseThrow(() -> new RuntimeException("Order not found"));

	    if (!order.getUser().getId().equals(user.getId())) { // 🔥 ADD
	        throw new OrderException("Access denied");
	    }

	    return order;
	}

	// ---------- helpers ----------

	private User getCurrentUser() {
		String email = SecurityContextHolder.getContext().getAuthentication().getName();

		return userRepository.findByEmail(email).orElseThrow(() -> new OrderException("User not found"));
	}

	private String generateOrderNumber() {
	    return "OD" + System.currentTimeMillis()
	           + (int)(Math.random() * 1000);
	}


	private String formatAddress(UserAddress a) {
		return a.getAddressLine1() + ", " + (a.getAddressLine2() != null ? a.getAddressLine2() + ", " : "")
				+ a.getCity() + ", " + a.getState() + " - " + a.getPincode();
	}

	private OrderResponse map(Order order) {

		List<OrderItem> items = orderItemRepository.findByOrder(order);
		
		Payment payment = paymentRepository.findByOrder(order).orElse(null);

		String txnId = null;
		if (payment != null) {
		    txnId = payment.getTransactionId();
		}

		return OrderResponse.builder().orderNumber(order.getOrderNumber()).totalAmount(order.getTotalAmount())
				.deliveryCharge(order.getDeliveryCharge()).finalAmount(order.getFinalAmount())
				 // ✅ ADD THESE TWO LINES HERE
	            .discount(
	                order.getCoupon() != null
	                    ? order.getTotalAmount()
	                          .add(order.getDeliveryCharge())
	                          .subtract(order.getFinalAmount())
	                    : BigDecimal.ZERO
	            )
	            .couponCode(
	                order.getCoupon() != null
	                    ? order.getCoupon().getCode()
	                    : null
	            )
				.cancellationCharge(order.getCancellationCharge()).refundAmount(order.getRefundAmount())
				.orderStatus(order.getOrderStatus()).paymentStatus(order.getPaymentStatus())
				  // ✅ ADD THESE
				.paymentMethod(
					    order.getPaymentMethod() != null
					        ? order.getPaymentMethod().name()
					        : (order.getPaymentStatus() == PaymentStatus.PAID
					            ? "WALLET"
					            : "COD")
					)
			    .transactionId(txnId)
				.deliveryAddress(order.getDeliveryAddress()).createdAt(order.getCreatedAt())
				.items(items.stream()
						.map(i -> OrderItemResponse.builder().id(i.getId()).
								productName(i.getProductName()).unit(i.getUnit())
								.price(i.getPrice()).quantity(i.getQuantity()).totalPrice(i.getTotalPrice()).build())
						.toList())
				.build();
	}
}
