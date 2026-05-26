package com.rajbhog.controller.admin;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.rajbhog.dto.request.AdminProductRequest;
import com.rajbhog.dto.response.ProductResponse;
import com.rajbhog.service.AdminProductService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final AdminProductService adminProductService;

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(
            @Validated @RequestBody AdminProductRequest request) {
        return ResponseEntity.ok(adminProductService.createProduct(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Validated @RequestBody AdminProductRequest request) {
        return ResponseEntity.ok(adminProductService.updateProduct(id, request));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ProductResponse> toggleProduct(@PathVariable Long id) {
        return ResponseEntity.ok(adminProductService.toggleProductStatus(id));
    }


    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        return ResponseEntity.ok(adminProductService.getAllProducts());
    }
}
