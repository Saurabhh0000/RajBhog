package com.rajbhog.controller;

import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rajbhog.dto.request.PlaceOrderRequest;
import com.rajbhog.dto.response.OrderEmailDto;
import com.rajbhog.dto.response.OrderResponse;
import com.rajbhog.dto.response.PlaceOrderResponse;
import com.rajbhog.entity.Order;
import com.rajbhog.entity.Payment;
import com.rajbhog.repository.PaymentRepository;
import com.rajbhog.service.InvoiceService;
import com.rajbhog.service.OrderService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders")
public class OrderController {

    private final OrderService orderService;
    private final InvoiceService invoiceService;
    private final PaymentRepository paymentRepository;

    @PostMapping
    public ResponseEntity<PlaceOrderResponse> placeOrder(
            @RequestBody PlaceOrderRequest request) {

        return ResponseEntity.ok(
                orderService.placeOrder(
                        request.getCouponCode(),
                        request.isUseWallet()
                )
        );
    }


    @GetMapping
    public ResponseEntity<List<OrderResponse>> getMyOrders() {
        return ResponseEntity.ok(orderService.getMyOrders());
    }

    @GetMapping("/{orderNumber}")
    public ResponseEntity<OrderResponse> getOrder(
            @PathVariable String orderNumber) {

        return ResponseEntity.ok(
                orderService.getOrderByOrderNumber(orderNumber)
        );
    }
    
    @PostMapping("/{orderNumber}/return")
    public ResponseEntity<Void> requestReturn(
            @PathVariable String orderNumber,
            @RequestParam String reason) {

        orderService.requestReturn(orderNumber, reason);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{orderNumber}/cancel")
    public ResponseEntity<Void> cancelOrder(
            @PathVariable String orderNumber) {

        orderService.cancelOrder(orderNumber);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/{orderNumber}/invoice")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable String orderNumber) {

        Order order = orderService.getByOrderNumber(orderNumber);
        

        Payment payment = paymentRepository.findByOrder(order).orElse(null);

        String txnId = "N/A";
        if (payment != null && payment.getTransactionId() != null) {
            txnId = payment.getTransactionId();
        }

        OrderEmailDto dto = OrderEmailDto.builder()
                .orderNumber(order.getOrderNumber())
                .customerName(order.getUser().getFullName())
                .customerEmail(order.getUser().getEmail())
                .transactionId(txnId)
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
                                .name(i.getProductName())
                                .unit(i.getUnit())
                                .quantity(i.getQuantity())
                                .price(i.getTotalPrice())
                                .build()
                ).toList())
                .build();

        byte[] pdf = invoiceService.generateInvoiceFromDto(dto);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=invoice_" + orderNumber + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}


