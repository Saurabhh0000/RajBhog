package com.rajbhog.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rajbhog.dto.request.UpdateReviewStatusRequest;
import com.rajbhog.dto.response.AdminReviewResponse;
import com.rajbhog.entity.Review;
import com.rajbhog.exception.ResourceNotFoundException;
import com.rajbhog.repository.ReviewRepository;
import com.rajbhog.service.AdminReviewService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminReviewServiceImpl implements AdminReviewService {

    private final ReviewRepository reviewRepository;

    @Override
    public List<AdminReviewResponse> getAllReviews() {

        return reviewRepository.findAll()
                .stream()
                .map(this::map)
                .toList();
    }

    @Override
    public void updateReviewStatus(Long reviewId, UpdateReviewStatusRequest request) {

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        review.setIsApproved(request.getApproved());
    }

    private AdminReviewResponse map(Review r) {
        return AdminReviewResponse.builder()
                .id(r.getId())
                .productName(r.getProductVariant().getProduct().getName())
                .unit(r.getProductVariant().getUnit())
                .rating(r.getRating())
                .comment(r.getComment())
                .approved(r.getIsApproved())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
