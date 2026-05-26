package com.rajbhog.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ContactRequest {

    @NotBlank
    private String name;

    @NotBlank
    @Email
    private String email;

    private String phone; // optional

    @NotBlank
    private String subject;

    @NotBlank
    private String message;
}
