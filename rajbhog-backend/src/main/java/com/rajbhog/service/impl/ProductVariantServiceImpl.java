package com.rajbhog.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.rajbhog.dto.request.ProductVariantRequest;
import com.rajbhog.dto.response.ProductVariantResponse;
import com.rajbhog.entity.Product;
import com.rajbhog.entity.ProductVariant;
import com.rajbhog.repository.ProductRepository;
import com.rajbhog.repository.ProductVariantRepository;
import com.rajbhog.service.ProductVariantService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductVariantServiceImpl implements ProductVariantService {

    private final ProductVariantRepository variantRepository;
    private final ProductRepository productRepository;

    @Override
    public List<ProductVariantResponse> getVariantsByProduct(Long productId) {

        return variantRepository.findByProductIdAndIsActiveTrue(productId)
                .stream()
                .map(this::map)
                .toList();
    }

    @Override
    public ProductVariantResponse createVariant(ProductVariantRequest request) {

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (variantRepository.existsByProductIdAndUnit(
                request.getProductId(), request.getUnit())) {
            throw new IllegalArgumentException("Variant already exists for this unit");
        }

        ProductVariant variant = variantRepository.save(
                ProductVariant.builder()
                        .product(product)
                        .unit(request.getUnit())
                        .price(request.getPrice())
                        .stock(request.getStock())
                        .isActive(
                            request.getIsActive() != null ? request.getIsActive() : true
                        )
                        .build()
        );

        return map(variant);
    }

    @Override
    public ProductVariantResponse updateVariant(
            Long variantId, ProductVariantRequest request) {

        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found"));

        variant.setUnit(request.getUnit());
        variant.setPrice(request.getPrice());
        variant.setStock(request.getStock());

        if (request.getIsActive() != null) {
            variant.setIsActive(request.getIsActive());
        }

        return map(variant);
    }

    @Override
    public void toggleVariantStatus(Long variantId) {

        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found"));

        variant.setIsActive(!variant.getIsActive());
    }

    // 🔁 Mapper
    private ProductVariantResponse map(ProductVariant v) {
        return ProductVariantResponse.builder()
                .id(v.getId())
                .unit(v.getUnit())
                .price(v.getPrice())
                .stock(v.getStock())
                .isActive(v.getIsActive())
                .productId(v.getProduct().getId())
                .productName(v.getProduct().getName())
                .build();
    }
}

