package com.rajbhog.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.rajbhog.dto.request.AddReviewRequest;
import com.rajbhog.dto.response.ReviewResponse;
import com.rajbhog.service.ReviewService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ReviewResponse> addReview(
            @Validated @RequestBody AddReviewRequest request) {
        return ResponseEntity.ok(reviewService.addReview(request));
    }

    @GetMapping("/variant/{variantId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsByVariant(
            @PathVariable Long variantId) {
        return ResponseEntity.ok(reviewService.getReviewsByVariant(variantId));
    }

    @GetMapping("/me")
    public ResponseEntity<List<ReviewResponse>> getMyReviews() {
        return ResponseEntity.ok(reviewService.getMyReviews());
    }
}
