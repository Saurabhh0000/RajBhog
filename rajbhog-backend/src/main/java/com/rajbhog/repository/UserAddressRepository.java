package com.rajbhog.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import com.rajbhog.entity.User;
import com.rajbhog.entity.UserAddress;

public interface UserAddressRepository extends JpaRepository<UserAddress, Long> {

    // Get all addresses of logged-in user
    List<UserAddress> findByUser(User user);

    // Ownership-safe fetch
    Optional<UserAddress> findByIdAndUser(Long id, User user);

    // Get default address (optional use)
    Optional<UserAddress> findByUserAndIsDefaultTrue(User user);

    // Clear default address before setting new one
    @Modifying
    @Query("UPDATE UserAddress a SET a.isDefault = false WHERE a.user = :user")
    void clearDefaultForUser(@Param("user") User user);
}
