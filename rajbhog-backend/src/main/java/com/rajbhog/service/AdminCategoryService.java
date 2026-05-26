package com.rajbhog.service;

import java.util.List;

import com.rajbhog.dto.request.AdminCategoryRequest;
import com.rajbhog.dto.response.CategoryResponse;

public interface AdminCategoryService {

    CategoryResponse createCategory(AdminCategoryRequest request);

    CategoryResponse updateCategory(Long categoryId, AdminCategoryRequest request);

    void toggleCategoryStatus(Long categoryId);

    List<CategoryResponse> getAllCategories();
}
