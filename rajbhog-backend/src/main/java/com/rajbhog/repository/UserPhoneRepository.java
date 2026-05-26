package com.rajbhog.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.rajbhog.entity.User;
import com.rajbhog.entity.UserPhone;

public interface UserPhoneRepository extends JpaRepository<UserPhone, Long> {

    List<UserPhone> findByUser(User user);

    Optional<UserPhone> findByIdAndUser(Long id, User user);

    boolean existsByUserAndPhoneNumber(User user, String phoneNumber);

    Optional<UserPhone> findByUserAndIsPrimaryTrue(User user);

    @Modifying
    @Query("UPDATE UserPhone p SET p.isPrimary = false WHERE p.user = :user")
    void clearPrimaryForUser(@Param("user") User user);
}

