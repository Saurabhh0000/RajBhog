package com.rajbhog.dto.request;

import com.rajbhog.enums.PaymentStatus;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdatePaymentStatusRequest {

    @NotNull
    private PaymentStatus paymentStatus;
}
