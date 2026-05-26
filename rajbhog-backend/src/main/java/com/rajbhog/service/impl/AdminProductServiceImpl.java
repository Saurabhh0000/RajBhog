package com.rajbhog.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rajbhog.dto.request.AdminProductRequest;
import com.rajbhog.dto.response.ProductResponse;
import com.rajbhog.entity.Category;
import com.rajbhog.entity.Product;
import com.rajbhog.exception.ResourceNotFoundException;
import com.rajbhog.repository.CategoryRepository;
import com.rajbhog.repository.ProductRepository;
import com.rajbhog.service.AdminProductService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminProductServiceImpl implements AdminProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public ProductResponse createProduct(AdminProductRequest request) {

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (productRepository.existsBySlug(request.getSlug())) {
            throw new IllegalArgumentException("Product slug already exists");
        }

        Product product = productRepository.save(
                Product.builder()
                        .category(category)
                        .name(request.getName())
                        .slug(request.getSlug())
                        .description(request.getDescription())
                        .imageUrl(request.getImageUrl())
                        .isActive(
                                request.getIsActive() != null
                                        ? request.getIsActive()
                                        : true
                        )
                        .build()
        );

        return map(product);
    }

    @Override
    public ProductResponse updateProduct(Long productId, AdminProductRequest request) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        product.setCategory(category);
        product.setName(request.getName());
        product.setSlug(request.getSlug());
        product.setDescription(request.getDescription());
        product.setImageUrl(request.getImageUrl());

        if (request.getIsActive() != null) {
            product.setIsActive(request.getIsActive());
        }

        return map(product);
    }

    @Override
    public ProductResponse toggleProductStatus(Long productId) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        product.setIsActive(!product.getIsActive());
        return map(product);
    }

    @Override
    public List<ProductResponse> getAllProducts() {

        return productRepository.findAll()
                .stream()
                .map(this::map)
                .toList();
    }

    // 🔁 Mapper (NO variant data here)
    private ProductResponse map(Product p) {
        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .slug(p.getSlug())
                .description(p.getDescription())
                .imageUrl(p.getImageUrl())
                .isActive(p.getIsActive())
                .categoryId(p.getCategory().getId())
                .categoryName(p.getCategory().getName())
                .build();
    }
}
