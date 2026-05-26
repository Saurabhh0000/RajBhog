package com.rajbhog.service.impl;

import org.springframework.stereotype.Service;

import com.rajbhog.dto.response.AdminDashboardResponse;
import com.rajbhog.enums.ContactStatus;
import com.rajbhog.enums.OrderStatus;
import com.rajbhog.enums.Role;
import com.rajbhog.repository.ContactRepository;
import com.rajbhog.repository.OrderRepository;
import com.rajbhog.repository.ProductRepository;
import com.rajbhog.repository.ProductVariantRepository;
import com.rajbhog.repository.ReviewRepository;
import com.rajbhog.repository.UserRepository;
import com.rajbhog.service.AdminDashboardService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ContactRepository contactRepository;
    private final ReviewRepository reviewRepository;

    @Override
    public AdminDashboardResponse getDashboardStats() {

        return AdminDashboardResponse.builder()

                // 👤 USERS
                .totalUsers(userRepository.countByRole(Role.CUSTOMER))
                .totalAdmins(userRepository.countByRole(Role.ADMIN))

                // 📦 ORDERS
                .totalOrders(orderRepository.count())
                .pendingOrders(orderRepository.countByOrderStatus(OrderStatus.PLACED))
                .deliveredOrders(orderRepository.countByOrderStatus(OrderStatus.DELIVERED))

                // 🛍️ PRODUCTS
                .totalProducts(productRepository.count())
                .outOfStockVariants(productVariantRepository.countByStockLessThanEqual(0))

                // 📩 SUPPORT / REVIEWS
                .openContacts(contactRepository.countByStatus(ContactStatus.OPEN))
                .pendingReviews(reviewRepository.countByIsApprovedFalse())

                .build();
    }
}

