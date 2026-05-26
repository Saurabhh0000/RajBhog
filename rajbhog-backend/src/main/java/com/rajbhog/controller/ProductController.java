package com.rajbhog.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rajbhog.dto.request.ProductRequest;
import com.rajbhog.dto.response.ProductResponse;
import com.rajbhog.service.ProductService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Products")
public class ProductController {

    private final ProductService productService;

    // 🌍 PUBLIC
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ProductResponse>> getByCategory(
            @PathVariable Long categoryId) {

        return ResponseEntity.ok(
                productService.getProductsByCategory(categoryId)
        );
    }
    @GetMapping("/category/slug/{slug}")
    public ResponseEntity<List<ProductResponse>> getByCategorySlug(
            @PathVariable String slug) {

        return ResponseEntity.ok(
                productService.getProductsByCategorySlug(slug)
        );
    }
    @GetMapping("/slug/{slug}")
    public ResponseEntity<ProductResponse> getBySlug(
            @PathVariable String slug) {

        return ResponseEntity.ok(productService.getProductBySlug(slug));
    }


    // 🔐 ADMIN
    @PostMapping
    public ResponseEntity<ProductResponse> create(
            @RequestBody ProductRequest request) {

        return ResponseEntity.ok(
                productService.createProduct(request)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> update(
            @PathVariable Long id,
            @RequestBody ProductRequest request) {

        return ResponseEntity.ok(
                productService.updateProduct(id, request)
        );
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Void> toggle(@PathVariable Long id) {
        productService.toggleProductStatus(id);
        return ResponseEntity.noContent().build();
    }
}

