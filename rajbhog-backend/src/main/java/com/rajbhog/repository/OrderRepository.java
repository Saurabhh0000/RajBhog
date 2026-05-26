package com.rajbhog.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.rajbhog.entity.Order;
import com.rajbhog.entity.User;
import com.rajbhog.enums.OrderStatus;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    boolean existsByOrderNumber(String orderNumber);

    // Secure: uses User entity
    List<Order> findByUserOrderByCreatedAtDesc(User user);

    // Admin use (future)
    List<Order> findByOrderStatus(OrderStatus orderStatus);
    
    long countByOrderStatus(OrderStatus status);
    
    List<Order> findAllByOrderByCreatedAtDesc();
    
    long countByUser(User user);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.user = :user")
    Optional<BigDecimal> sumTotalAmountByUser(User user);


}
