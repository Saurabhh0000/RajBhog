package com.rajbhog.dto.request;

import com.rajbhog.enums.ContactStatus;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateContactStatusRequest {

    @NotNull
    private ContactStatus status; // OPEN, IN_PROGRESS, RESOLVED
    private String resolutionMessage;
}
