package com.rajbhog.service;

import java.util.List;

import com.rajbhog.dto.request.ProductRequest;
import com.rajbhog.dto.response.ProductResponse;

public interface ProductService {

    // Public
    List<ProductResponse> getProductsByCategory(Long categoryId);
    List<ProductResponse> getProductsByCategorySlug(String slug);
    ProductResponse getProductBySlug(String slug);


    // Admin
    ProductResponse createProduct(ProductRequest request);

    ProductResponse updateProduct(Long productId, ProductRequest request);

    void toggleProductStatus(Long productId);
}

