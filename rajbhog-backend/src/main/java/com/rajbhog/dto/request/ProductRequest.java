package com.rajbhog.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductRequest {

    private Long categoryId;

    private String name;

    private String slug;

    private String description;

    private String imageUrl;

    private Boolean isActive;
}

