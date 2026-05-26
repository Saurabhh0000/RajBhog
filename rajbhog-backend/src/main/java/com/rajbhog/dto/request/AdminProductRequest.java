package com.rajbhog.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminProductRequest {

    @NotNull
    private Long categoryId;

    @NotBlank
    private String name;

    @NotBlank
    private String slug;

    private String description;

    private String imageUrl;

    private Boolean isActive;
}
