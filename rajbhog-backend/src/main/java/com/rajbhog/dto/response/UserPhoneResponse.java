package com.rajbhog.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserPhoneResponse {
    private Long id;
    private String phoneNumber;
    private Boolean isPrimary;
    private Boolean isVerified;
}

