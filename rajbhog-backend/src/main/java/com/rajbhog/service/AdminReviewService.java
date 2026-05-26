package com.rajbhog.service;

import java.util.List;

import com.rajbhog.dto.request.UpdateReviewStatusRequest;
import com.rajbhog.dto.response.AdminReviewResponse;

public interface AdminReviewService {

    List<AdminReviewResponse> getAllReviews();

    void updateReviewStatus(Long reviewId, UpdateReviewStatusRequest request);
}
