package com.rajbhog.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminCategoryRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String slug;

    private String description;

    private String imageUrl;

    private Integer displayOrder;

    private Boolean isActive;
}
