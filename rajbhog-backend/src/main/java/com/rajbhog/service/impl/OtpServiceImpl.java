package com.rajbhog.service.impl;

import java.time.LocalDateTime;
import java.util.Random;

import org.springframework.stereotype.Service;

import com.rajbhog.entity.OtpVerification;
import com.rajbhog.repository.OtpVerificationRepository;
import com.rajbhog.service.EmailService;
import com.rajbhog.service.OtpService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class OtpServiceImpl implements OtpService {

    private final OtpVerificationRepository otpRepository;
    private final EmailService emailService;

    @Override
    public void sendOtp(String email) {

        // Clear old OTPs
        otpRepository.deleteByEmail(email);

        // Generate OTP
        String otp = generateOtp();

        // Save OTP
        OtpVerification otpEntity = OtpVerification.builder()
                .email(email)
                .otp(otp)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .build();

        otpRepository.save(otpEntity);

        // Send email
        emailService.sendOtpEmail(email, otp);
    }

    @Override
    public boolean verifyOtp(String email, String otp) {

        return otpRepository.findTopByEmailOrderByCreatedAtDesc(email)
                .filter(saved -> saved.getOtp().equals(otp))
                .filter(saved -> saved.getExpiresAt().isAfter(LocalDateTime.now()))
                .map(valid -> {
                    otpRepository.deleteByEmail(email);
                    return true;
                })
                .orElse(false);
    }

    private String generateOtp() {
        return String.valueOf(100000 + new Random().nextInt(900000));
    }
}
