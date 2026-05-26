package com.rajbhog.service;

import java.util.List;

import com.rajbhog.dto.request.ProductVariantRequest;
import com.rajbhog.dto.response.ProductVariantResponse;

public interface ProductVariantService {

    // Public
    List<ProductVariantResponse> getVariantsByProduct(Long productId);

    // Admin
    ProductVariantResponse createVariant(ProductVariantRequest request);

    ProductVariantResponse updateVariant(Long variantId, ProductVariantRequest request);

    void toggleVariantStatus(Long variantId);
}

