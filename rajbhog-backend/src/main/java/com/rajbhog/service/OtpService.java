package com.rajbhog.service;

public interface OtpService {

    /**
     * Generates and sends OTP to the given email.
     * Used for login & registration.
     */
    void sendOtp(String email);

    /**
     * Verifies OTP for the given email.
     * @return true if OTP is valid and not expired
     */
    boolean verifyOtp(String email, String otp);
}
