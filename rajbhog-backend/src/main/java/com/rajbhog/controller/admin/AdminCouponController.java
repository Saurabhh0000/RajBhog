package com.rajbhog.controller.admin;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.rajbhog.dto.request.AdminCouponRequest;
import com.rajbhog.dto.response.CouponResponse;
import com.rajbhog.service.AdminCouponService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/coupons")
@RequiredArgsConstructor
public class AdminCouponController {

    private final AdminCouponService adminCouponService;

    @PostMapping
    public ResponseEntity<CouponResponse> createCoupon(
            @Validated @RequestBody AdminCouponRequest request) {
        return ResponseEntity.ok(adminCouponService.createCoupon(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CouponResponse> updateCoupon(
            @PathVariable Long id,
            @Validated @RequestBody AdminCouponRequest request) {
        return ResponseEntity.ok(adminCouponService.updateCoupon(id, request));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Void> toggleCoupon(@PathVariable Long id) {
        adminCouponService.toggleCouponStatus(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<CouponResponse>> getAllCoupons() {
        return ResponseEntity.ok(adminCouponService.getAllCoupons());
    }
}
