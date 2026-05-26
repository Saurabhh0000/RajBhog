package com.rajbhog.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.rajbhog.dto.request.ContactRequest;
import com.rajbhog.dto.response.ContactResponse;
import com.rajbhog.service.ContactService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    // 🌍 PUBLIC (guest + logged-in)
    @PostMapping
    public ResponseEntity<ContactResponse> submitContact(
            @Validated @RequestBody ContactRequest request) {
        return ResponseEntity.ok(contactService.submitContact(request));
    }

    // 👤 USER – view own tickets
    @GetMapping("/me")
    public ResponseEntity<List<ContactResponse>> getMyContacts() {
        return ResponseEntity.ok(contactService.getMyContacts());
    }

    // 🔐 ADMIN – view all tickets
    @GetMapping("/admin")
    public ResponseEntity<List<ContactResponse>> getAllContacts() {
        return ResponseEntity.ok(contactService.getAllContacts());
    }
}
