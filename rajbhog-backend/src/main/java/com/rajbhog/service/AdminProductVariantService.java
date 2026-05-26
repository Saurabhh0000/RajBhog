package com.rajbhog.service;

import java.util.List;

import com.rajbhog.dto.request.AdminProductVariantRequest;
import com.rajbhog.dto.response.ProductVariantResponse;

public interface AdminProductVariantService {

    ProductVariantResponse createVariant(AdminProductVariantRequest request);

    ProductVariantResponse updateVariant(Long variantId, AdminProductVariantRequest request);

    ProductVariantResponse toggleVariantStatus(Long variantId);

    List<ProductVariantResponse> getVariantsByProduct(Long productId);
}
