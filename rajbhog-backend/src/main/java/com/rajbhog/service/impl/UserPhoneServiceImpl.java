package com.rajbhog.service.impl;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rajbhog.dto.request.AddPhoneRequest;
import com.rajbhog.dto.response.UserPhoneResponse;
import com.rajbhog.entity.User;
import com.rajbhog.entity.UserPhone;
import com.rajbhog.exception.ResourceNotFoundException;
import com.rajbhog.repository.UserPhoneRepository;
import com.rajbhog.repository.UserRepository;
import com.rajbhog.service.UserPhoneService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class UserPhoneServiceImpl implements UserPhoneService {

    private final UserRepository userRepository;
    private final UserPhoneRepository userPhoneRepository;

    @Override
    public UserPhoneResponse addPhone(AddPhoneRequest request) {

        User user = getCurrentUser();

        // Duplicate check (per user)
        if (userPhoneRepository.existsByUserAndPhoneNumber(user, request.getPhoneNumber())) {
            throw new IllegalArgumentException("Phone number already exists");
        }

        boolean hasPrimary =
                userPhoneRepository.findByUserAndIsPrimaryTrue(user).isPresent();

        UserPhone phone = userPhoneRepository.save(
                UserPhone.builder()
                        .phoneNumber(request.getPhoneNumber())
                        .user(user)
                        .isVerified(true)        // future phone OTP
                        .isPrimary(!hasPrimary)   // first phone auto-primary
                        .build()
        );

        return map(phone);
    }

    @Override
    public List<UserPhoneResponse> getMyPhones() {

        User user = getCurrentUser();

        return userPhoneRepository.findByUser(user)
                .stream()
                .map(this::map)
                .toList();
    }

    @Override
    public UserPhoneResponse makePrimary(Long phoneId) {

        User user = getCurrentUser();

        UserPhone phone = userPhoneRepository
                .findByIdAndUser(phoneId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Phone not found"));

        if (!phone.isVerified()) {
            throw new IllegalStateException("Phone must be verified before making primary");
        }

        userPhoneRepository.clearPrimaryForUser(user);
        phone.setPrimary(true);

        return map(phone);
    }

    @Override
    public void deletePhone(Long phoneId) {

        User user = getCurrentUser();

        UserPhone phone = userPhoneRepository
                .findByIdAndUser(phoneId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Phone not found"));

        userPhoneRepository.delete(phone);
    }

    // 🔐 Helpers

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private UserPhoneResponse map(UserPhone phone) {
        return UserPhoneResponse.builder()
                .id(phone.getId())
                .phoneNumber(phone.getPhoneNumber())
                .isPrimary(phone.isPrimary())
                .isVerified(phone.isVerified())
                .build();
    }
}
