package com.rajbhog.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rajbhog.entity.Cart;
import com.rajbhog.entity.CartItem;
import com.rajbhog.entity.ProductVariant;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByCart(Cart cart);

    Optional<CartItem> findByCartAndVariant(Cart cart, ProductVariant variant);
}
