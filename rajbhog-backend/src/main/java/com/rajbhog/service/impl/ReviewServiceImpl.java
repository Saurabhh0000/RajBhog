package com.rajbhog.service.impl;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rajbhog.dto.request.AddReviewRequest;
import com.rajbhog.dto.response.ReviewResponse;
import com.rajbhog.entity.*;
import com.rajbhog.enums.OrderStatus;
import com.rajbhog.exception.OrderException;
import com.rajbhog.repository.*;
import com.rajbhog.service.ReviewService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;

    @Override
    public ReviewResponse addReview(AddReviewRequest request) {

        User user = getCurrentUser();

        OrderItem orderItem = orderItemRepository.findById(request.getOrderItemId())
                .orElseThrow(() -> new OrderException("Order item not found"));

        // Ownership check
        if (!orderItem.getOrder().getUser().getId().equals(user.getId())) {
            throw new OrderException("You cannot review this item");
        }

        // Delivered check
        if (orderItem.getOrder().getOrderStatus() != OrderStatus.DELIVERED) {
            throw new OrderException("You can review only delivered items");
        }

        // One review per item
        if (reviewRepository.existsByOrderItemId(orderItem.getId())) {
            throw new OrderException("You already reviewed this item");
        }

        Review review = reviewRepository.save(
                Review.builder()
                        .user(user)
                        .orderItem(orderItem)
                        .productVariant(orderItem.getProductVariant())
                        .rating(request.getRating())
                        .comment(request.getComment())
                        .isApproved(false) // admin approval later
                        .build()
        );

        return map(review);
    }

    @Override
    public List<ReviewResponse> getReviewsByVariant(Long variantId) {

        return reviewRepository.findByProductVariantIdAndIsApprovedTrue(variantId)
                .stream()
                .map(this::map)
                .toList();
    }

    @Override
    public List<ReviewResponse> getMyReviews() {

        User user = getCurrentUser();

        return reviewRepository.findByUserId(user.getId())
                .stream()
                .map(this::map)
                .toList();
    }

    // 🔐 helpers

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new OrderException("User not found"));
    }

    private ReviewResponse map(Review r) {
        return ReviewResponse.builder()
                .id(r.getId())
                .rating(r.getRating())
                .comment(r.getComment())
                .productName(r.getProductVariant().getProduct().getName())
                .unit(r.getProductVariant().getUnit())
                .userName(r.getUser().getFullName())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
