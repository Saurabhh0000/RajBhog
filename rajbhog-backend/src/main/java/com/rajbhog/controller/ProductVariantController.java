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

import com.rajbhog.dto.request.ProductVariantRequest;
import com.rajbhog.dto.response.ProductVariantResponse;
import com.rajbhog.service.ProductVariantService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/variants")
@RequiredArgsConstructor
@Tag(name = "Product Variants")
public class ProductVariantController {

    private final ProductVariantService variantService;

    // 🌍 PUBLIC
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ProductVariantResponse>> getByProduct(
            @PathVariable Long productId) {

        return ResponseEntity.ok(
                variantService.getVariantsByProduct(productId)
        );
    }

    // 🔐 ADMIN
    @PostMapping
    public ResponseEntity<ProductVariantResponse> create(
            @RequestBody ProductVariantRequest request) {

        return ResponseEntity.ok(
                variantService.createVariant(request)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductVariantResponse> update(
            @PathVariable Long id,
            @RequestBody ProductVariantRequest request) {

        return ResponseEntity.ok(
                variantService.updateVariant(id, request)
        );
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Void> toggle(@PathVariable Long id) {
        variantService.toggleVariantStatus(id);
        return ResponseEntity.noContent().build();
    }
}

