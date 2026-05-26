package com.rajbhog.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rajbhog.entity.Order;
import com.rajbhog.entity.Payment;
import com.rajbhog.enums.PaymentStatus;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // 🔗 One payment per order
    Optional<Payment> findByOrder(Order order);

    // 🔍 Useful for admin / reconciliation
    boolean existsByOrder(Order order);

    // 🔍 Admin filtering
    long countByPaymentStatus(PaymentStatus status);
    
    List<Payment> findAllByOrderByCreatedAtDesc();
    
    Optional<Payment> findByGatewayOrderId(String gatewayOrderId);
    
    


}
