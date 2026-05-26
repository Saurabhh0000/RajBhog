package com.rajbhog.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminDashboardResponse {

    // 👤 USERS
    private long totalUsers;     // CUSTOMERS only
    private long totalAdmins;

    // 📦 ORDERS
    private long totalOrders;
    private long pendingOrders;
    private long deliveredOrders;

    // 🛍️ PRODUCTS
    private long totalProducts;
    private long outOfStockVariants;

    // 📩 SUPPORT / REVIEWS
    private long openContacts;
    private long pendingReviews;
}
