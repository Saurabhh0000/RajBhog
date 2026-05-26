package com.rajbhog.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.rajbhog.dto.request.AddPhoneRequest;
import com.rajbhog.dto.response.UserPhoneResponse;
import com.rajbhog.service.UserPhoneService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/profile/phones")
@RequiredArgsConstructor
@Tag(name = "User Phones")
public class UserPhoneController {

    private final UserPhoneService userPhoneService;

    @PostMapping
    public ResponseEntity<UserPhoneResponse> addPhone(
            @Validated @RequestBody AddPhoneRequest request) {

        return ResponseEntity.ok(userPhoneService.addPhone(request));
    }

    @GetMapping
    public ResponseEntity<List<UserPhoneResponse>> getMyPhones() {
        return ResponseEntity.ok(userPhoneService.getMyPhones());
    }

    @PutMapping("/{id}/primary")
    public ResponseEntity<UserPhoneResponse> makePrimary(@PathVariable Long id) {
        return ResponseEntity.ok(userPhoneService.makePrimary(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePhone(@PathVariable Long id) {
        userPhoneService.deletePhone(id);
        return ResponseEntity.noContent().build();
    }
}
