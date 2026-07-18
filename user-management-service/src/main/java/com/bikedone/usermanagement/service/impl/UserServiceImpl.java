package com.bikedone.usermanagement.service.impl;

import com.bikedone.usermanagement.common.security.PasswordPolicyValidator;
import com.bikedone.usermanagement.dto.request.ChangePasswordRequest;
import com.bikedone.usermanagement.dto.request.UpdateProfileRequest;
import com.bikedone.usermanagement.dto.response.UserProfileResponse;
import com.bikedone.usermanagement.entity.User;
import com.bikedone.usermanagement.exception.BadRequestException;
import com.bikedone.usermanagement.mapper.UserMapper;
import com.bikedone.usermanagement.repository.UserRepository;
import com.bikedone.usermanagement.security.authentication.AuthenticationFacade;
import com.bikedone.usermanagement.security.token.RefreshTokenService;
import com.bikedone.usermanagement.security.user.UserPrincipal;
import com.bikedone.usermanagement.service.UserService;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final AuthenticationFacade authenticationFacade;

    private final UserRepository userRepository;

    private final UserMapper userMapper;

    private final PasswordEncoder passwordEncoder;

    private final RefreshTokenService refreshTokenService;

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

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest request) {

        UserPrincipal principal = authenticationFacade.getCurrentUser();

        User user = userRepository.findUserWithRoleByEmail(principal.getUsername())
                .orElseThrow(() -> new BadRequestException("User not found."));

        // 1. Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect.");
        }

        // 2. Verify new password and confirm password
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New password and confirm password do not match.");
        }

        // 3. Verify new password is different
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new BadRequestException("New password cannot be the same as your current password.");
        }

        PasswordPolicyValidator.validate(
                request.getCurrentPassword(),
                request.getNewPassword());

        // 4. Encode new password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));

        // 5. Save user
        userRepository.save(user);

        // 6. Revoke all refresh tokens
        refreshTokenService.revokeAllUserTokens(user.getId());
    }
}