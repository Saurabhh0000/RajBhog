package com.rajbhog.service;

import java.util.List;

import com.rajbhog.dto.request.UpdateOrderStatusRequest;
import com.rajbhog.dto.request.UpdatePaymentStatusRequest;
import com.rajbhog.dto.response.AdminOrderResponse;
import com.rajbhog.enums.OrderStatus;

public interface AdminOrderService {

    List<AdminOrderResponse> getAllOrders();

    AdminOrderResponse getOrderByOrderNumber(String orderNumber);
    
    void handleReturn(String orderNumber, OrderStatus status);

    void updateOrderStatus(String orderNumber, UpdateOrderStatusRequest request);

}
