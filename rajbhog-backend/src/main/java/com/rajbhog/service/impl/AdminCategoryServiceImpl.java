package com.rajbhog.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rajbhog.dto.request.AdminCategoryRequest;
import com.rajbhog.dto.response.CategoryResponse;
import com.rajbhog.entity.Category;
import com.rajbhog.exception.ResourceNotFoundException;
import com.rajbhog.repository.CategoryRepository;
import com.rajbhog.service.AdminCategoryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminCategoryServiceImpl implements AdminCategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public CategoryResponse createCategory(AdminCategoryRequest request) {

        if (categoryRepository.existsBySlug(request.getSlug())) {
            throw new IllegalArgumentException("Category slug already exists");
        }

        Category category = categoryRepository.save(
                Category.builder()
                        .name(request.getName())
                        .slug(request.getSlug())
                        .description(request.getDescription())
                        .imageUrl(request.getImageUrl())
                        .displayOrder(request.getDisplayOrder())
                        .isActive(
                                request.getIsActive() != null
                                        ? request.getIsActive()
                                        : true
                        )
                        .build()
        );

        return map(category);
    }

    @Override
    public CategoryResponse updateCategory(Long categoryId, AdminCategoryRequest request) {

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        category.setName(request.getName());
        category.setSlug(request.getSlug());
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());
        category.setDisplayOrder(request.getDisplayOrder());

        if (request.getIsActive() != null) {
            category.setActive(request.getIsActive());
        }

        return map(category);
    }

    @Override
    public void toggleCategoryStatus(Long categoryId) {

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        category.setActive(!category.isActive());
    }

    @Override
    public List<CategoryResponse> getAllCategories() {

        return categoryRepository.findAllByOrderByDisplayOrderAsc()
                .stream()
                .map(this::map)
                .toList();
    }

    // 🔁 Mapper
    private CategoryResponse map(Category c) {
        return CategoryResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .slug(c.getSlug())
                .description(c.getDescription())
                .imageUrl(c.getImageUrl())
                .displayOrder(c.getDisplayOrder())
                .isActive(c.isActive())
                .build();
    }
}
