package com.rajbhog.service;

import java.util.List;

import com.rajbhog.dto.request.AdminProductRequest;
import com.rajbhog.dto.response.ProductResponse;

public interface AdminProductService {

    ProductResponse createProduct(AdminProductRequest request);

    ProductResponse updateProduct(Long productId, AdminProductRequest request);

    ProductResponse toggleProductStatus(Long productId);

    List<ProductResponse> getAllProducts();
}
