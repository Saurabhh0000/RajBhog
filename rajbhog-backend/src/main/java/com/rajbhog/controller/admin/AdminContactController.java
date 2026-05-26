package com.rajbhog.controller.admin;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.rajbhog.dto.request.UpdateContactStatusRequest;
import com.rajbhog.dto.response.AdminContactResponse;
import com.rajbhog.service.AdminContactService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/contacts")
@RequiredArgsConstructor
public class AdminContactController {

    private final AdminContactService adminContactService;

    @GetMapping
    public ResponseEntity<List<AdminContactResponse>> getAllContacts() {
        return ResponseEntity.ok(adminContactService.getAllContacts());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable Long id,
            @Validated @RequestBody UpdateContactStatusRequest request) {

        adminContactService.updateContactStatus(id, request);
        return ResponseEntity.noContent().build();
    }
}
