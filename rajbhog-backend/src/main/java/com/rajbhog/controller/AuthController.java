package com.rajbhog.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rajbhog.dto.request.SendOtpRequest;
import com.rajbhog.dto.request.VerifyOtpRequest;
import com.rajbhog.dto.response.ApiResponse;
import com.rajbhog.dto.response.AuthResponse;
import com.rajbhog.service.AuthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "OTP based authentication APIs")
public class AuthController {

    private final AuthService authService;

    /**
     * Send OTP to email (Login / Registration)
     */
    
    @Operation(summary = "Send OTP to email")
    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse> sendOtp(
            @Valid @RequestBody SendOtpRequest request) {

        authService.sendOtp(request.getEmail());

        return ResponseEntity.ok(
                new ApiResponse(true, "OTP sent successfully")
        );
    }

    /**
     * Verify OTP and login / auto-register user
     */
    @Operation(summary = "Verify OTP and login")
    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request) {

        AuthResponse response =
                authService.verifyOtpAndLogin(
                        request.getEmail(),
                        request.getOtp()
                );

        return ResponseEntity.ok(response);
    }
}
