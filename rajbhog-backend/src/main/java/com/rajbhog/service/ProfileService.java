package com.rajbhog.service;

import com.rajbhog.dto.response.UserProfileResponse;

public interface ProfileService {

    UserProfileResponse getMyProfile();

    UserProfileResponse updateFullName(String fullName);
}
