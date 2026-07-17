package com.bikedone.usermanagement.service.impl;

import com.bikedone.usermanagement.dto.request.UpdateProfileRequest;
import com.bikedone.usermanagement.dto.response.UserProfileResponse;
import com.bikedone.usermanagement.entity.User;
import com.bikedone.usermanagement.exception.BadRequestException;
import com.bikedone.usermanagement.mapper.UserMapper;
import com.bikedone.usermanagement.repository.UserRepository;
import com.bikedone.usermanagement.security.authentication.AuthenticationFacade;
import com.bikedone.usermanagement.security.user.UserPrincipal;
import com.bikedone.usermanagement.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final AuthenticationFacade authenticationFacade;

    private final UserRepository userRepository;

    private final UserMapper userMapper;

    @Override
    public UserProfileResponse getMyProfile() {

        UserPrincipal principal = authenticationFacade.getCurrentUser();

        User user = userRepository.findUserWithRoleByEmail(principal.getUsername())
                .orElseThrow(() -> new BadRequestException("User not found."));

        return userMapper.toProfileResponse(user);
    }

    @Override
    public UserProfileResponse updateMyProfile(UpdateProfileRequest request) {

        UserPrincipal principal = authenticationFacade.getCurrentUser();

        User user = userRepository.findUserWithRoleByEmail(principal.getUsername())
                .orElseThrow(() -> new BadRequestException("User not found."));

        userMapper.updateUserFromRequest(request, user);

        User updatedUser = userRepository.save(user);

        return userMapper.toProfileResponse(updatedUser);

    }
}