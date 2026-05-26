package com.rajbhog.service;

import java.util.List;

import com.rajbhog.dto.response.OrderResponse;
import com.rajbhog.dto.response.PlaceOrderResponse;
import com.rajbhog.entity.Order;

public interface OrderService {

	public PlaceOrderResponse placeOrder(String couponCode, boolean useWallet);
	void requestReturn(String orderNumber, String reason);
	
    void cancelOrder(String orderNumber);

    List<OrderResponse> getMyOrders();

    OrderResponse getOrderByOrderNumber(String orderNumber);
    
    Order getByOrderNumber(String orderNumber);
}

