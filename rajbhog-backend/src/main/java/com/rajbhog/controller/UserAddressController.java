package com.rajbhog.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.rajbhog.dto.request.AddAddressRequest;
import com.rajbhog.dto.response.UserAddressResponse;
import com.rajbhog.service.UserAddressService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/profile/addresses")
@RequiredArgsConstructor
@Tag(name = "User Addresses")
public class UserAddressController {

    private final UserAddressService userAddressService;

    // 1️⃣ Add new address
    @PostMapping
    public ResponseEntity<UserAddressResponse> addAddress(
            @Validated @RequestBody AddAddressRequest request) {

        return ResponseEntity.ok(userAddressService.addAddress(request));
    }

    // 2️⃣ Get all my addresses
    @GetMapping
    public ResponseEntity<List<UserAddressResponse>> getMyAddresses() {
        return ResponseEntity.ok(userAddressService.getMyAddresses());
    }

    // 3️⃣ Make address default
    @PutMapping("/{id}/default")
    public ResponseEntity<UserAddressResponse> makeDefault(
            @PathVariable Long id) {

        return ResponseEntity.ok(userAddressService.makeDefault(id));
    }

    // 4️⃣ Delete address
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long id) {
        userAddressService.deleteAddress(id);
        return ResponseEntity.noContent().build();
    }
}
