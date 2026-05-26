package com.rajbhog.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rajbhog.dto.request.AdminProductVariantRequest;
import com.rajbhog.dto.response.ProductVariantResponse;
import com.rajbhog.entity.Product;
import com.rajbhog.entity.ProductVariant;
import com.rajbhog.exception.ResourceNotFoundException;
import com.rajbhog.repository.ProductRepository;
import com.rajbhog.repository.ProductVariantRepository;
import com.rajbhog.service.AdminProductVariantService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminProductVariantServiceImpl implements AdminProductVariantService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;

    @Override
    public ProductVariantResponse createVariant(AdminProductVariantRequest request) {

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (productVariantRepository
                .existsByProductAndUnit(product, request.getUnit())) {
            throw new IllegalArgumentException("Variant with this unit already exists");
        }

        ProductVariant variant = productVariantRepository.save(
                ProductVariant.builder()
                        .product(product)
                        .unit(request.getUnit())
                        .price(request.getPrice())
                        .stock(request.getStock())
                        .isActive(
                                request.getIsActive() != null
                                        ? request.getIsActive()
                                        : true
                        )
                        .build()
        );

        return map(variant);
    }

    @Override
    public ProductVariantResponse updateVariant(Long variantId, AdminProductVariantRequest request) {

        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found"));

        variant.setUnit(request.getUnit());
        variant.setPrice(request.getPrice());
        variant.setStock(request.getStock());

        if (request.getIsActive() != null) {
            variant.setIsActive(request.getIsActive());
        }

        return map(variant);
    }

    @Override
    public ProductVariantResponse toggleVariantStatus(Long variantId) {

        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found"));

        variant.setIsActive(!variant.getIsActive());
        
        return map(variant);
    }

    @Override
    public List<ProductVariantResponse> getVariantsByProduct(Long productId) {

        return productVariantRepository.findByProductId(productId)
                .stream()
                .map(this::map)
                .toList();
    }

    // 🔁 Mapper
    private ProductVariantResponse map(ProductVariant v) {
        return ProductVariantResponse.builder()
                .id(v.getId())
                .productId(v.getProduct().getId())
                .productName(v.getProduct().getName())
                .unit(v.getUnit())
                .price(v.getPrice())
                .stock(v.getStock())
                .isActive(v.getIsActive())
                .build();
    }
}
