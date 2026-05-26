package com.rajbhog.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import com.rajbhog.entity.Coupon;

public interface CouponRepository extends JpaRepository<Coupon, Long> {

    Optional<Coupon> findByCodeIgnoreCase(String code);
    boolean existsByCodeIgnoreCase(String code);
    
    @Query("""
    		SELECT c FROM Coupon c 
    		WHERE c.active = true 
    		AND c.showBanner = true 
    		AND c.expiryAt > CURRENT_TIMESTAMP
    		""")
    		List<Coupon> findActiveCoupons();
    
    @Modifying
    @Query("UPDATE Coupon c SET c.usedCount = c.usedCount + 1 WHERE c.id = :id")
    void incrementUsage(Long id);
    
    

}
