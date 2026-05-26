package com.rajbhog.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rajbhog.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // Public – list active products by category
    List<Product> findByCategoryIdAndIsActiveTrue(Long categoryId);
    
    Optional<Product> findBySlugAndIsActiveTrue(String slug);


    // Public/Admin – product detail by slug
    Optional<Product> findBySlug(String slug);

    // Admin – slug uniqueness check
    boolean existsBySlug(String slug);

    // Public – home / featured listing
    List<Product> findByIsActiveTrue();
}
