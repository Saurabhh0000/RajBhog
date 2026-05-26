package com.rajbhog.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rajbhog.entity.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    boolean existsByOrderItemId(Long orderItemId);

    List<Review> findByProductVariantIdAndIsApprovedTrue(Long variantId);

    List<Review> findByUserId(Long userId);

    Optional<Review> findByOrderItemId(Long orderItemId);
    
    long countByIsApprovedFalse();

}
