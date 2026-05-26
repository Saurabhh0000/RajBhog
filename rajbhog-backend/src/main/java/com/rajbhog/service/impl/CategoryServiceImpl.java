package com.rajbhog.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.rajbhog.dto.request.CategoryRequest;
import com.rajbhog.dto.response.CategoryResponse;
import com.rajbhog.entity.Category;
import com.rajbhog.repository.CategoryRepository;
import com.rajbhog.service.CategoryService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public List<CategoryResponse> getActiveCategories() {
        return categoryRepository.findByIsActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(this::map)
                .toList();
    }

    @Override
    public CategoryResponse createCategory(CategoryRequest request) {

        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new IllegalArgumentException("Category name already exists");
        }

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
                            request.getIsActive() != null ? request.getIsActive() : true
                        )
                        .build()
        );

        return map(category);
    }

    @Override
    public CategoryResponse updateCategory(Long categoryId, CategoryRequest request) {

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

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
                .orElseThrow(() -> new RuntimeException("Category not found"));

        category.setActive(!category.isActive());
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

