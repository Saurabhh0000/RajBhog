package com.rajbhog.service;

import java.util.List;

import com.rajbhog.dto.request.AddAddressRequest;
import com.rajbhog.dto.response.UserAddressResponse;

public interface UserAddressService {

    UserAddressResponse addAddress(AddAddressRequest request);

    List<UserAddressResponse> getMyAddresses();

    UserAddressResponse makeDefault(Long addressId);

    void deleteAddress(Long addressId);
}
