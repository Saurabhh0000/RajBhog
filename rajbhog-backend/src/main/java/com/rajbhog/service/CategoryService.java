package com.rajbhog.service;

import java.util.List;

import com.rajbhog.dto.request.CategoryRequest;
import com.rajbhog.dto.response.CategoryResponse;

public interface CategoryService {

    // Public
    List<CategoryResponse> getActiveCategories();

    // Admin
    CategoryResponse createCategory(CategoryRequest request);

    CategoryResponse updateCategory(Long categoryId, CategoryRequest request);

    void toggleCategoryStatus(Long categoryId);
}

