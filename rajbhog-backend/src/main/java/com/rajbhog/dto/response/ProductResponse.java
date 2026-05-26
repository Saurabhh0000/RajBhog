package com.rajbhog.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProductResponse {

    private Long id;
    private String name;
    private String slug;
    private String description;
    private String imageUrl;
    private Boolean isActive;

    // Category info (read-only)
    private Long categoryId;
    private String categoryName;
    private String categorySlug;
}

