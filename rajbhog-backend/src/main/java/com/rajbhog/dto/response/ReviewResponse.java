package com.rajbhog.dto.response;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReviewResponse {

    private Long id;
    private int rating;
    private String comment;
    private String productName;
    private String unit;
    private String userName;
    private LocalDateTime createdAt;
}
