package com.rajbhog.service;

import java.util.List;

import com.rajbhog.dto.request.UpdatePaymentStatusRequest;
import com.rajbhog.dto.response.AdminPaymentResponse;

public interface AdminPaymentService {

    List<AdminPaymentResponse> getAllPayments();

    AdminPaymentResponse getPaymentByOrder(String orderNumber);

    void updatePaymentStatus(String orderNumber, UpdatePaymentStatusRequest request);
}
