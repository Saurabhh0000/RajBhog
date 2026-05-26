package com.rajbhog.controller.admin;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.rajbhog.dto.request.UpdatePaymentStatusRequest;
import com.rajbhog.dto.response.AdminPaymentResponse;
import com.rajbhog.service.AdminPaymentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/payments")
@RequiredArgsConstructor
public class AdminPaymentController {

    private final AdminPaymentService adminPaymentService;

    @GetMapping
    public ResponseEntity<List<AdminPaymentResponse>> getAllPayments() {
        return ResponseEntity.ok(adminPaymentService.getAllPayments());
    }

    @GetMapping("/order/{orderNumber}")
    public ResponseEntity<AdminPaymentResponse> getPaymentByOrder(
            @PathVariable String orderNumber) {
        return ResponseEntity.ok(
                adminPaymentService.getPaymentByOrder(orderNumber)
        );
    }

    @PatchMapping("/order/{orderNumber}")
    public ResponseEntity<Void> updatePaymentStatus(
            @PathVariable String orderNumber,
            @Validated @RequestBody UpdatePaymentStatusRequest request) {

        adminPaymentService.updatePaymentStatus(orderNumber, request);
        return ResponseEntity.noContent().build();
    }
}
