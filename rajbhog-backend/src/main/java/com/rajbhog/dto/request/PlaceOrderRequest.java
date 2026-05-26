package com.rajbhog.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PlaceOrderRequest {

    private String couponCode; // optional
    private boolean useWallet;
}
