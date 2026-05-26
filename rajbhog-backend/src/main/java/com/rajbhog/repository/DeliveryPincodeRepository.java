package com.rajbhog.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rajbhog.entity.DeliveryPincode;

public interface DeliveryPincodeRepository
        extends JpaRepository<DeliveryPincode, String> {

    boolean existsByPincode(String pincode);
}
