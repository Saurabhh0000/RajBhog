package com.rajbhog.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddReviewRequest {

    @NotNull
    private Long orderItemId;

    @Min(1)
    @Max(5)
    private int rating;

    private String comment;
}
