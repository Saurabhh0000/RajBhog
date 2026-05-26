package com.rajbhog.service;

import com.rajbhog.dto.response.AuthResponse;

public interface AuthService {

    /**
     * Sends OTP to email (login or signup).
     */
    void sendOtp(String email);

    /**
     * Verifies OTP and performs login / auto-registration.
     * @return AuthResponse with safe user info
     */
    AuthResponse verifyOtpAndLogin(String email, String otp);
}
