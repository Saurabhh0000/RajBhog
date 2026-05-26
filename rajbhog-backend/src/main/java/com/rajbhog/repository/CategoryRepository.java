package com.rajbhog.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rajbhog.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    // Public (users)
    List<Category> findByIsActiveTrueOrderByDisplayOrderAsc();

    // Admin usage
    Optional<Category> findBySlug(String slug);

    boolean existsByNameIgnoreCase(String name);

    boolean existsBySlug(String slug);
    
    List<Category> findAllByOrderByDisplayOrderAsc();

}
