package com.rajbhog.service;

import java.util.List;

import com.rajbhog.dto.request.AddReviewRequest;
import com.rajbhog.dto.response.ReviewResponse;

public interface ReviewService {

    ReviewResponse addReview(AddReviewRequest request);

    List<ReviewResponse> getReviewsByVariant(Long variantId);

    List<ReviewResponse> getMyReviews();
}
