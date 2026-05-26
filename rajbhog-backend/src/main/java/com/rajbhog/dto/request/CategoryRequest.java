package com.rajbhog.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryRequest {

    private String name;

    private String slug;

    private String description;

    private String imageUrl;

    private Integer displayOrder;

    private Boolean isActive;
}

