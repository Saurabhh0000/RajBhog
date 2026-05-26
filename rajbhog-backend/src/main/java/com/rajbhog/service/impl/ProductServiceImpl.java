package com.rajbhog.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.rajbhog.dto.request.ProductRequest;
import com.rajbhog.dto.response.ProductResponse;
import com.rajbhog.entity.Category;
import com.rajbhog.entity.Product;
import com.rajbhog.repository.CategoryRepository;
import com.rajbhog.repository.ProductRepository;
import com.rajbhog.service.ProductService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    // 🌍 PUBLIC
    @Override
    public List<ProductResponse> getProductsByCategory(Long categoryId) {

        if (!categoryRepository.existsById(categoryId)) {
            throw new RuntimeException("Category not found");
        }

        return productRepository.findByCategoryIdAndIsActiveTrue(categoryId)
                .stream()
                .map(this::map)
                .toList();
    }
    @Override
    public List<ProductResponse> getProductsByCategorySlug(String slug) {

        Category category = categoryRepository
                .findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        return productRepository
                .findByCategoryIdAndIsActiveTrue(category.getId())
                .stream()
                .map(this::map)
                .toList();
    }
    
    @Override
    public ProductResponse getProductBySlug(String slug) {

        Product product = productRepository
                .findBySlugAndIsActiveTrue(slug)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        return map(product);
    }



    // 🔐 ADMIN
    @Override
    public ProductResponse createProduct(ProductRequest request) {

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

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
    public ProductResponse updateProduct(Long productId, ProductRequest request) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getSlug().equals(request.getSlug())
                && productRepository.existsBySlug(request.getSlug())) {
            throw new IllegalArgumentException("Product slug already exists");
        }

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
    public void toggleProductStatus(Long productId) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setIsActive(!product.getIsActive());
    }

    // 🔁 Mapper
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
                .categorySlug(p.getCategory().getSlug())
                .build();
    }
}
