package com.rajbhog.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rajbhog.entity.Product;
import com.rajbhog.entity.ProductVariant;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    // Public
    List<ProductVariant> findByProductIdAndIsActiveTrue(Long productId);

    // Admin
    Optional<ProductVariant> findByIdAndProductId(Long id, Long productId);

    boolean existsByProductIdAndUnit(Long productId, String unit);
    
    long countByStockLessThanEqual(int stock);
    
    boolean existsByProductAndUnit(Product product, String unit);

    List<ProductVariant> findByProductId(Long productId);
    


}
