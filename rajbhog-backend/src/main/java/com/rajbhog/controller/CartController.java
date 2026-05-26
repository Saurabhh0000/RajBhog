package com.rajbhog.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.rajbhog.dto.request.AddToCartRequest;
import com.rajbhog.dto.response.CartItemResponse;
import com.rajbhog.service.CartService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Tag(name = "Cart")
public class CartController {

    private final CartService cartService;

    // 1️⃣ Add to cart
    @PostMapping
    public ResponseEntity<CartItemResponse> addToCart(
            @Validated @RequestBody AddToCartRequest request) {

        return ResponseEntity.ok(cartService.addToCart(request));
    }

    // 2️⃣ View cart
    @GetMapping
    public ResponseEntity<List<CartItemResponse>> getMyCart() {
        return ResponseEntity.ok(cartService.getMyCart());
    }

    // 3️⃣ Update quantity
    @PutMapping("/{id}")
    public ResponseEntity<CartItemResponse> updateQuantity(
            @PathVariable Long id,
            @RequestParam int quantity) {

        return ResponseEntity.ok(cartService.updateQuantity(id, quantity));
    }

    // 4️⃣ Remove item
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeItem(@PathVariable Long id) {
        cartService.removeItem(id);
        return ResponseEntity.noContent().build();
    }

    // 5️⃣ Clear cart
    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart() {
        cartService.clearCart();
        return ResponseEntity.noContent().build();
    }
}
