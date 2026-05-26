package com.rajbhog.service.impl;

import org.springframework.stereotype.Service;

import com.rajbhog.entity.UserAddress;
import com.rajbhog.exception.DeliveryNotAvailableException;
import com.rajbhog.repository.DeliveryPincodeRepository;
import com.rajbhog.service.DeliveryRadiusService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DeliveryRadiusServiceImpl implements DeliveryRadiusService {

    private final DeliveryPincodeRepository deliveryPincodeRepository;

    @Override
    public void validateDeliveryAddress(UserAddress address) {

        if (address == null) {
            throw new DeliveryNotAvailableException("No delivery address found");
        }

        boolean deliverable =
                deliveryPincodeRepository.existsByPincode(address.getPincode());

        if (!deliverable) {
            throw new DeliveryNotAvailableException(
                    "Delivery not available at this address"
            );
        }
    }
}
