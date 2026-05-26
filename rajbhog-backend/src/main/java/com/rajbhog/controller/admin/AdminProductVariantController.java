package com.rajbhog.controller.admin;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.rajbhog.dto.request.AdminProductVariantRequest;
import com.rajbhog.dto.response.ProductVariantResponse;
import com.rajbhog.service.AdminProductVariantService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/product-variants")
@RequiredArgsConstructor
public class AdminProductVariantController {

    private final AdminProductVariantService adminProductVariantService;

    @PostMapping
    public ResponseEntity<ProductVariantResponse> createVariant(
            @Validated @RequestBody AdminProductVariantRequest request) {
        return ResponseEntity.ok(adminProductVariantService.createVariant(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductVariantResponse> updateVariant(
            @PathVariable Long id,
            @Validated @RequestBody AdminProductVariantRequest request) {
        return ResponseEntity.ok(adminProductVariantService.updateVariant(id, request));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ProductVariantResponse> toggleVariant(@PathVariable Long id) {
        return ResponseEntity.ok(
            adminProductVariantService.toggleVariantStatus(id)
        );
    }


    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ProductVariantResponse>> getVariants(
            @PathVariable Long productId) {
        return ResponseEntity.ok(
                adminProductVariantService.getVariantsByProduct(productId)
        );
    }
}
