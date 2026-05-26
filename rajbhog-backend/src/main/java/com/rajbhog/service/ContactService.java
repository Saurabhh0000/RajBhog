package com.rajbhog.service;

import java.util.List;

import com.rajbhog.dto.request.ContactRequest;
import com.rajbhog.dto.response.ContactResponse;

public interface ContactService {

    ContactResponse submitContact(ContactRequest request);

    List<ContactResponse> getMyContacts();   // logged-in users

    List<ContactResponse> getAllContacts();  // admin
}
