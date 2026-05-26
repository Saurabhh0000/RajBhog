package com.rajbhog.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rajbhog.entity.Contact;
import com.rajbhog.enums.ContactStatus;

public interface ContactRepository extends JpaRepository<Contact, Long> {

    // 👤 Logged-in user: view own contact requests
    List<Contact> findByUserIdOrderByCreatedAtDesc(Long userId);

    // 🔐 Admin: filter contacts by status
    List<Contact> findByStatusOrderByCreatedAtDesc(ContactStatus status);

    // 🔐 Admin: get all contacts sorted
    List<Contact> findAllByOrderByCreatedAtDesc();
    
    long countByStatus(ContactStatus status);

}
