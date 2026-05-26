package com.rajbhog.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.rajbhog.dto.response.UserProfileResponse;
import com.rajbhog.service.ProfileService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@Tag(name = "User Profile")
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMyProfile() {
        return ResponseEntity.ok(profileService.getMyProfile());
    }

    @PutMapping("/name")
    public ResponseEntity<UserProfileResponse> updateFullName(
            @RequestParam String fullName) {
        return ResponseEntity.ok(profileService.updateFullName(fullName));
    }
}
