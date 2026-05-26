package com.rajbhog.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserAddressResponse {

    private Long id;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String pincode;
    private Boolean isDefault;
}
