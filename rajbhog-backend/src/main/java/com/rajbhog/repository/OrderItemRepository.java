package com.rajbhog.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rajbhog.entity.OrderItem;




import com.rajbhog.entity.Order;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrder(Order order);
}
