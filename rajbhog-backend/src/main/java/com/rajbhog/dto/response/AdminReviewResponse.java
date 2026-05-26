package com.rajbhog.dto.response;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminReviewResponse {

    private Long id;
    private String productName;
    private String unit;
    private int rating;
    private String comment;
    private Boolean approved;
    private LocalDateTime createdAt;
}
