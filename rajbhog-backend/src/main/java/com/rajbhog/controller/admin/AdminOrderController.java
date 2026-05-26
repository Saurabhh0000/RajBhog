package com.rajbhog.controller.admin;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rajbhog.dto.request.UpdateOrderStatusRequest;
import com.rajbhog.dto.request.UpdatePaymentStatusRequest;
import com.rajbhog.dto.response.AdminOrderResponse;
import com.rajbhog.enums.OrderStatus;
import com.rajbhog.service.AdminOrderService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final AdminOrderService adminOrderService;

    @GetMapping
    public ResponseEntity<List<AdminOrderResponse>> getAllOrders() {
        return ResponseEntity.ok(adminOrderService.getAllOrders());
    }

    @GetMapping("/{orderNumber}")
    public ResponseEntity<AdminOrderResponse> getOrder(
            @PathVariable String orderNumber) {
        return ResponseEntity.ok(
                adminOrderService.getOrderByOrderNumber(orderNumber)
        );
    }

    @PutMapping("/{orderNumber}/status")
    public ResponseEntity<Void> updateOrderStatus(
            @PathVariable String orderNumber,
            @Validated @RequestBody UpdateOrderStatusRequest request) {

        adminOrderService.updateOrderStatus(orderNumber, request);
        return ResponseEntity.noContent().build();
    }
    @PatchMapping("/{orderNumber}/return")
    public ResponseEntity<Void> handleReturn(
            @PathVariable String orderNumber,
            @RequestParam OrderStatus status) {

        adminOrderService.handleReturn(orderNumber, status);
        return ResponseEntity.noContent().build();
    }
//
//    @PutMapping("/{orderNumber}/payment")
//    public ResponseEntity<Void> updatePaymentStatus(
//            @PathVariable String orderNumber,
//            @Validated @RequestBody UpdatePaymentStatusRequest request) {
//
//        adminOrderService.updatePaymentStatus(orderNumber, request);
//        return ResponseEntity.noContent().build();
//    }
}
