package com.rajbhog.controller.admin;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.rajbhog.dto.request.AdminCategoryRequest;
import com.rajbhog.dto.response.CategoryResponse;
import com.rajbhog.service.AdminCategoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final AdminCategoryService adminCategoryService;

    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(
            @Validated @RequestBody AdminCategoryRequest request) {
        return ResponseEntity.ok(adminCategoryService.createCategory(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @Validated @RequestBody AdminCategoryRequest request) {
        return ResponseEntity.ok(adminCategoryService.updateCategory(id, request));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Void> toggleCategory(@PathVariable Long id) {
        adminCategoryService.toggleCategoryStatus(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        return ResponseEntity.ok(adminCategoryService.getAllCategories());
    }
}
