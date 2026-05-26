package com.rajbhog.dto.response;

import java.time.LocalDateTime;

import com.rajbhog.enums.ContactStatus;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ContactResponse {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private String subject;
    private String message;
    private String resolutionMessage;
    private ContactStatus status;
    private LocalDateTime createdAt;
}
