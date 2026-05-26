package com.rajbhog.service;

import java.util.List;

import com.rajbhog.dto.request.AddPhoneRequest;
import com.rajbhog.dto.response.UserPhoneResponse;

public interface UserPhoneService {

    UserPhoneResponse addPhone(AddPhoneRequest request);

    List<UserPhoneResponse> getMyPhones();

    UserPhoneResponse makePrimary(Long phoneId);

    void deletePhone(Long phoneId);
}
