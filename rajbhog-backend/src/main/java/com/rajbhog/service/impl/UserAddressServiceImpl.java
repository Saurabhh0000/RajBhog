package com.rajbhog.service.impl;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rajbhog.dto.request.AddAddressRequest;
import com.rajbhog.dto.response.UserAddressResponse;
import com.rajbhog.entity.User;
import com.rajbhog.entity.UserAddress;
import com.rajbhog.exception.ResourceNotFoundException;
import com.rajbhog.repository.UserAddressRepository;
import com.rajbhog.repository.UserRepository;
import com.rajbhog.service.UserAddressService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class UserAddressServiceImpl implements UserAddressService {

    private final UserRepository userRepository;
    private final UserAddressRepository userAddressRepository;

    @Override
    public UserAddressResponse addAddress(AddAddressRequest request) {

        User user = getCurrentUser();
        
        boolean isDefault = Boolean.TRUE.equals(request.getIsDefault());

        // If new address is default → clear old default
        if (isDefault) {
            userAddressRepository.clearDefaultForUser(user);
        }

        UserAddress address = userAddressRepository.save(
                UserAddress.builder()
                        .user(user)
                        .addressLine1(request.getAddressLine1())
                        .addressLine2(request.getAddressLine2())
                        .city(request.getCity())
                        .state(request.getState())
                        .pincode(request.getPincode())
                        .isDefault(isDefault)
                        .build()
        );

        return map(address);
    }

    @Override
    public List<UserAddressResponse> getMyAddresses() {

        User user = getCurrentUser();

        return userAddressRepository.findByUser(user)
                .stream()
                .map(this::map)
                .toList();
    }

    @Override
    public UserAddressResponse makeDefault(Long addressId) {

        User user = getCurrentUser();

        UserAddress address = userAddressRepository
                .findByIdAndUser(addressId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        userAddressRepository.clearDefaultForUser(user);
        address.setDefault(true);

        return map(address);
    }

    @Override
    public void deleteAddress(Long addressId) {

        User user = getCurrentUser();

        UserAddress address = userAddressRepository
                .findByIdAndUser(addressId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        userAddressRepository.delete(address);
    }

    // 🔐 Helpers

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private UserAddressResponse map(UserAddress a) {
        return UserAddressResponse.builder()
                .id(a.getId())
                .addressLine1(a.getAddressLine1())
                .addressLine2(a.getAddressLine2())
                .city(a.getCity())
                .state(a.getState())
                .pincode(a.getPincode())
                .isDefault(a.isDefault())
                .build();
    }
}
