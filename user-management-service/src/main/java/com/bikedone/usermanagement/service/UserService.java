package com.bikedone.usermanagement.service;

import com.bikedone.usermanagement.dto.request.UpdateProfileRequest;
import com.bikedone.usermanagement.dto.response.UserProfileResponse;

public interface UserService {

    UserProfileResponse getMyProfile();
    UserProfileResponse updateMyProfile(UpdateProfileRequest request);
}