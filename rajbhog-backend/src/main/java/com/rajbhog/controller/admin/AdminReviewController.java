package com.rajbhog.controller.admin;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.rajbhog.dto.request.UpdateReviewStatusRequest;
import com.rajbhog.dto.response.AdminReviewResponse;
import com.rajbhog.service.AdminReviewService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
public class AdminReviewController {

    private final AdminReviewService adminReviewService;

    @GetMapping
    public ResponseEntity<List<AdminReviewResponse>> getAllReviews() {
        return ResponseEntity.ok(adminReviewService.getAllReviews());
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Void> updateReviewStatus(
            @PathVariable Long id,
            @Validated @RequestBody UpdateReviewStatusRequest request) {

        adminReviewService.updateReviewStatus(id, request);
        return ResponseEntity.noContent().build();
    }
}
