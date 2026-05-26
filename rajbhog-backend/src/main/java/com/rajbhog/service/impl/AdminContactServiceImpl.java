package com.rajbhog.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rajbhog.dto.request.UpdateContactStatusRequest;
import com.rajbhog.dto.response.AdminContactResponse;
import com.rajbhog.entity.Contact;
import com.rajbhog.enums.ContactStatus;
import com.rajbhog.exception.ResourceNotFoundException;
import com.rajbhog.repository.ContactRepository;
import com.rajbhog.service.AdminContactService;
import com.rajbhog.service.EmailService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminContactServiceImpl implements AdminContactService {

    private final ContactRepository contactRepository;
    private final EmailService emailService;

    @Override
    public List<AdminContactResponse> getAllContacts() {

        return contactRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::map)
                .toList();
    }

    @Override
    public void updateContactStatus(Long contactId, UpdateContactStatusRequest request) {

        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));

        // ✅ prevent duplicate update
        if (contact.getStatus() == request.getStatus()) {
            return;
        }

        // ✅ validation
        if ((request.getStatus() == ContactStatus.RESOLVED
                || request.getStatus() == ContactStatus.CLOSED)
            && (request.getResolutionMessage() == null
                || request.getResolutionMessage().isBlank())) {

            throw new IllegalArgumentException("Resolution message required");
        }

        contact.setStatus(request.getStatus());
        contact.setResolutionMessage(request.getResolutionMessage());

        // ✅ save first
        contactRepository.save(contact);

        // 🔥 send email
        if (contact.getEmail() != null &&
            (request.getStatus() == ContactStatus.RESOLVED
             || request.getStatus() == ContactStatus.CLOSED)) {

            emailService.sendTicketUpdateEmail(
                contact.getEmail(),
                contact.getName(),
                "Your Ticket is " + request.getStatus() + " - " + contact.getSubject(),
                contact.getSubject(),
                request.getResolutionMessage(),
                request.getStatus().name()
            );
        }
    }

    private AdminContactResponse map(Contact c) {
        return AdminContactResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .email(c.getEmail())
                .phone(c.getPhone())
                .subject(c.getSubject())
                .message(c.getMessage())
                .status(c.getStatus())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
