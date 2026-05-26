package com.rajbhog.service.impl;

import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.rajbhog.dto.response.AuthResponse;
import com.rajbhog.entity.User;
import com.rajbhog.enums.Role;
import com.rajbhog.exception.InvalidOtpException;
import com.rajbhog.repository.UserRepository;
import com.rajbhog.service.AuthService;
import com.rajbhog.service.EmailService;
import com.rajbhog.service.OtpService;
import com.rajbhog.security.JwtService;


import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final OtpService otpService;
    private final EmailService emailService;
    private final JwtService jwtService;


    @Override
    public void sendOtp(String email) {
        otpService.sendOtp(email);
    }

    @Override
    public AuthResponse verifyOtpAndLogin(String email, String otp) {

        // 1️⃣ Verify OTP
        boolean valid = otpService.verifyOtp(email, otp);
        if (!valid) {
            throw new InvalidOtpException();
        }

        User user = userRepository.findByEmail(email).orElse(null);
        boolean isCreatedNow = false;
        if (user == null) {
            user = userRepository.save(
                    User.builder()
                            .email(email)
                            .role(Role.CUSTOMER)
                            .isVerified(true)
                            .build()
            );
            isCreatedNow = true;
        }

     // profile-based new user
        boolean isNewUser = user.getFullName() == null 
                || user.getFullName().trim().isEmpty();

     // 🔐 Generate JWT
        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole().name()
        );


     // send email only once
        if (isCreatedNow) {
            emailService.sendWelcomeEmail(user.getEmail());
        }

     // 📦 Response
        return AuthResponse.builder()
                .email(user.getEmail())
                .role(user.getRole())
                .token(token)
                .isNewUser(isNewUser)
                .message("Login successful")
                .build();
    }
}
