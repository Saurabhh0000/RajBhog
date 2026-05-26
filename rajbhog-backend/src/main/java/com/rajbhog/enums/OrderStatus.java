package com.rajbhog.enums;

public enum OrderStatus {
    PLACED,              // Order created
    CONFIRMED,           // Admin confirmed
    PACKED,              // Items packed
    OUT_FOR_DELIVERY,    // Delivery started
    DELIVERED,           // Completed
    CANCELLED,          // Cancelled
    RETURN_REQUESTED,
    RETURN_APPROVED,
    RETURN_REJECTED
}


