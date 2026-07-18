package com.bikedone.usermanagement.controller;

import com.bikedone.usermanagement.common.datetime.DateTimeProvider;
import com.bikedone.usermanagement.common.response.ApiResponse;
import com.bikedone.usermanagement.dto.request.ChangePasswordRequest;
import com.bikedone.usermanagement.dto.request.UpdateProfileRequest;
import com.bikedone.usermanagement.dto.response.UserProfileResponse;
import com.bikedone.usermanagement.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    private final DateTimeProvider dateTimeProvider;

    @GetMapping("/me")
    public ApiResponse<UserProfileResponse> getMyProfile() {

        UserProfileResponse response = userService.getMyProfile();

        return ApiResponse.<UserProfileResponse>builder()
                .success(true)
                .message("Profile fetched successfully.")
                .data(response)
                .timestamp(dateTimeProvider.now())
                .build();
    }

    @PutMapping("/me")
    public ApiResponse<UserProfileResponse> updateMyProfile(
            @Valid @RequestBody UpdateProfileRequest request) {

        UserProfileResponse response =
                userService.updateMyProfile(request);

        return ApiResponse.<UserProfileResponse>builder()
                .success(true)
                .message("Profile updated successfully.")
                .data(response)
                .timestamp(dateTimeProvider.now())
                .build();
    }

    @PutMapping("/change-password")
    public ApiResponse<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {

        userService.changePassword(request);

        return ApiResponse.<Void>builder()
                .success(true)
                .message("Password changed successfully.")
                .timestamp(dateTimeProvider.now())
                .build();
    }

}