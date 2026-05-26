package com.rajbhog.dto.response;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserProfileResponse {

    private String email;
    private String fullName;
    private String role;
    private LocalDateTime createdAt;
}
