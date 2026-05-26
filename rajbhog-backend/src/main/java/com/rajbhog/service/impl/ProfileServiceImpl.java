package com.rajbhog.service.impl;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rajbhog.dto.response.UserProfileResponse;
import com.rajbhog.entity.User;
import com.rajbhog.exception.ResourceNotFoundException;
import com.rajbhog.repository.UserRepository;
import com.rajbhog.service.ProfileService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ProfileServiceImpl implements ProfileService {

    private final UserRepository userRepository;

    @Override
    public UserProfileResponse getMyProfile() {

        String email = getCurrentUserEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return mapToResponse(user);
    }

    @Override
    public UserProfileResponse updateFullName(String fullName) {

        String email = getCurrentUserEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setFullName(fullName);

        return mapToResponse(user);
    }

    // 🔐 Helper: get logged-in user's email
    private String getCurrentUserEmail() {
        return SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
    }

    private UserProfileResponse mapToResponse(User user) {
        return UserProfileResponse.builder()
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
