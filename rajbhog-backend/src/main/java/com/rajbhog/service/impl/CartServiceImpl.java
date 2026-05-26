package com.rajbhog.service.impl;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rajbhog.dto.request.AddToCartRequest;
import com.rajbhog.dto.response.CartItemResponse;
import com.rajbhog.entity.Cart;
import com.rajbhog.entity.CartItem;
import com.rajbhog.entity.ProductVariant;
import com.rajbhog.entity.User;
import com.rajbhog.exception.ResourceNotFoundException;
import com.rajbhog.repository.CartItemRepository;
import com.rajbhog.repository.CartRepository;
import com.rajbhog.repository.ProductVariantRepository;
import com.rajbhog.repository.UserRepository;
import com.rajbhog.service.CartService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CartServiceImpl implements CartService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository productVariantRepository;

    @Override
    public CartItemResponse addToCart(AddToCartRequest request) {

        User user = getCurrentUser();

        // 1️⃣ Get or create cart
        Cart cart = cartRepository
                .findByUser(user)
                .orElseGet(() ->
                        cartRepository.save(
                                Cart.builder().user(user).build()
                        )
                );

     // 2️⃣ Get product variant
        ProductVariant variant = productVariantRepository
                .findById(request.getProductVariantId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Product variant not found")
                );
        if (!variant.getIsActive()) {
            throw new IllegalArgumentException("This product variant is not available");
        }

     // 3️⃣ Get or create cart item
        CartItem item = cartItemRepository
                .findByCartAndVariant(cart, variant)
                .orElseGet(() ->
                        CartItem.builder()
                                .cart(cart)
                                .variant(variant)
                                .quantity(0)
                                .build()
                );

        // 4️⃣ Update quantity
        int newQty = item.getQuantity() + request.getQuantity();

        if (variant.getStock() < newQty) {
            throw new IllegalArgumentException("Only " + variant.getStock() + " items available");
        }

        item.setQuantity(newQty);

        cartItemRepository.save(item);

        return map(item);
    }

    @Override
    public List<CartItemResponse> getMyCart() {

        User user = getCurrentUser();

        Cart cart = cartRepository
                .findByUser(user)
                .orElseGet(() ->
                        cartRepository.save(
                                Cart.builder().user(user).build()
                        )
                );

        List<CartItem> items = cartItemRepository.findByCart(cart);

        return items.stream()
                .map(this::map)
                .toList();
    }


    @Override
    public CartItemResponse updateQuantity(Long cartItemId, int quantity) {

        if (quantity < 1) {
            throw new IllegalArgumentException("Quantity must be at least 1");
        }

        User user = getCurrentUser();

        Cart cart = cartRepository
                .findByUser(user)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Cart not found")
                );

        CartItem item = cartItemRepository.findById(cartItemId)
                .filter(i -> i.getCart().getId().equals(cart.getId()))
                .orElseThrow(() ->
                        new ResourceNotFoundException("Cart item not found")
                );

        if (item.getVariant().getStock() < quantity) {
            throw new IllegalArgumentException(
                "Only " + item.getVariant().getStock() + " items available"
            );
        }

        item.setQuantity(quantity);

        return map(item);
    }

    @Override
    public void removeItem(Long cartItemId) {

        User user = getCurrentUser();

        Cart cart = cartRepository
                .findByUser(user)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Cart not found")
                );

        CartItem item = cartItemRepository.findById(cartItemId)
                .filter(i -> i.getCart().getId().equals(cart.getId()))
                .orElseThrow(() ->
                        new ResourceNotFoundException("Cart item not found")
                );

        cartItemRepository.delete(item);
    }

    @Override
    public void clearCart() {

        User user = getCurrentUser();

        Cart cart = cartRepository
                .findByUser(user)
                .orElseGet(() ->
                        cartRepository.save(
                                Cart.builder().user(user).build()
                        )
                );

        List<CartItem> items = cartItemRepository.findByCart(cart);

        if (!items.isEmpty()) {
            cartItemRepository.deleteAll(items);
        }
    }


    // 🔐 Helpers

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );
    }

    private CartItemResponse map(CartItem item) {

        BigDecimal price = item.getVariant().getPrice();
        int qty = item.getQuantity();

        return CartItemResponse.builder()
                .id(item.getId())
                .productVariantId(item.getVariant().getId())
                .productName(item.getVariant().getProduct().getName())
                .unit(item.getVariant().getUnit())
                .price(price)
                .quantity(qty)
                .totalPrice(price.multiply(BigDecimal.valueOf(qty)))
                .build();
    }
}
