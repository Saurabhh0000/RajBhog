package com.rajbhog.dto.response;

import com.rajbhog.enums.Role;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthResponse {

    private String email;
    private Role role;
    private String token;
    private Boolean isNewUser;

    private String message;
}
