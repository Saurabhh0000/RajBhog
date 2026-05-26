package com.rajbhog.service;

import java.util.List;

import com.rajbhog.dto.request.AddToCartRequest;
import com.rajbhog.dto.response.CartItemResponse;

public interface CartService {

    CartItemResponse addToCart(AddToCartRequest request);

    List<CartItemResponse> getMyCart();

    CartItemResponse updateQuantity(Long cartItemId, int quantity);

    void removeItem(Long cartItemId);

    void clearCart();
}
