package com.rajbhog.service.impl;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rajbhog.dto.request.ContactRequest;
import com.rajbhog.dto.response.ContactResponse;
import com.rajbhog.entity.Contact;
import com.rajbhog.entity.User;
import com.rajbhog.enums.ContactStatus;
import com.rajbhog.exception.ResourceNotFoundException;
import com.rajbhog.repository.ContactRepository;
import com.rajbhog.repository.UserRepository;
import com.rajbhog.service.ContactService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ContactServiceImpl implements ContactService {

    private final ContactRepository contactRepository;
    private final UserRepository userRepository;

    @Override
    public ContactResponse submitContact(ContactRequest request) {

        User user = getLoggedInUserOrNull();

        Contact contact = contactRepository.save(
                Contact.builder()
                        .user(user) // may be null (guest)
                        .name(request.getName())
                        .email(request.getEmail())
                        .phone(request.getPhone())
                        .subject(request.getSubject())
                        .message(request.getMessage())
                        .status(ContactStatus.OPEN)
                        .build()
        );

        return map(contact);
    }

    @Override
    public List<ContactResponse> getMyContacts() {

        User user = getLoggedInUser();

        return contactRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::map)
                .toList();
    }

    @Override
    public List<ContactResponse> getAllContacts() {

        return contactRepository.findAll()
                .stream()
                .map(this::map)
                .toList();
    }

    // 🔐 helpers

    private User getLoggedInUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private User getLoggedInUserOrNull() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()
                || auth.getPrincipal().equals("anonymousUser")) {
            return null;
        }

        return userRepository.findByEmail(auth.getName()).orElse(null);
    }

    private ContactResponse map(Contact c) {
        return ContactResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .email(c.getEmail())
                .phone(c.getPhone())
                .subject(c.getSubject())
                .message(c.getMessage())
                .resolutionMessage(c.getResolutionMessage())
                .status(c.getStatus())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
