package com.rajbhog.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rajbhog.dto.request.CreatePaymentRequest;
import com.rajbhog.dto.response.PaymentResponse;
import com.rajbhog.service.PaymentService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments")
public class PaymentController {

    private final PaymentService paymentService;

    // Phase 1
    @PostMapping("/{orderNumber}")
    public ResponseEntity<PaymentResponse> createPayment(
            @PathVariable String orderNumber,
            @RequestBody CreatePaymentRequest request) {

        return ResponseEntity.ok(
                paymentService.createPayment(orderNumber, request)
        );
    }

    @GetMapping("/{orderNumber}")
    public ResponseEntity<PaymentResponse> getPayment(
            @PathVariable String orderNumber) {

        return ResponseEntity.ok(
                paymentService.getPaymentByOrder(orderNumber)
        );
    }

    @PutMapping("/{orderNumber}/mark-paid")
    public ResponseEntity<Void> markPaid(@PathVariable String orderNumber) {
        paymentService.markPaymentAsPaid(orderNumber);
        return ResponseEntity.noContent().build();
    }

    // Phase 2
    @PostMapping("/{orderNumber}/razorpay")
    public ResponseEntity<PaymentResponse> createRazorpayOrder(
            @PathVariable String orderNumber) {

        return ResponseEntity.ok(
                paymentService.createRazorpayOrder(orderNumber)
        );
    }

    @PostMapping("/razorpay/verify")
    public ResponseEntity<Void> verifyRazorpay(
            @RequestParam String razorpayOrderId,
            @RequestParam String razorpayPaymentId,
            @RequestParam String razorpaySignature) {

        paymentService.verifyRazorpayPayment(
                razorpayOrderId,
                razorpayPaymentId,
                razorpaySignature
        );
        return ResponseEntity.noContent().build();
    }
}
