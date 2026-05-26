package com.rajbhog.service;

import com.rajbhog.dto.request.CreatePaymentRequest;
import com.rajbhog.dto.response.PaymentResponse;

public interface PaymentService {

    /**
     * Create payment for an order
     * - One order → one payment
     * - Payment starts as PENDING
     */
    PaymentResponse createPayment(
            String orderNumber,
            CreatePaymentRequest request
    );

    /**
     * Get payment details for an order
     * - Ownership-safe
     */
    PaymentResponse getPaymentByOrder(
            String orderNumber
    );

    /**
     * Admin action:
     * - Mark COD payment as PAID
     */
    void markPaymentAsPaid(
            String orderNumber
    );
    
 // Phase 2
    PaymentResponse createRazorpayOrder(String orderNumber);

    void verifyRazorpayPayment(
            String razorpayOrderId,
            String razorpayPaymentId,
            String razorpaySignature
    );

 
}
