package com.rajbhog.service;

import java.util.List;

import com.rajbhog.dto.request.UpdateContactStatusRequest;
import com.rajbhog.dto.response.AdminContactResponse;

public interface AdminContactService {

    List<AdminContactResponse> getAllContacts();

    void updateContactStatus(Long contactId, UpdateContactStatusRequest request);
}
