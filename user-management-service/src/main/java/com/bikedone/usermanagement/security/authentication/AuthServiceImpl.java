package com.bikedone.usermanagement.security.authentication;

import com.bikedone.usermanagement.config.JwtProperties;
import com.bikedone.usermanagement.constants.SecurityConstants;
import com.bikedone.usermanagement.dto.request.LoginRequest;
import com.bikedone.usermanagement.dto.request.RefreshTokenRequest;
import com.bikedone.usermanagement.dto.request.SignupRequest;
import com.bikedone.usermanagement.dto.response.LoginResponse;
import com.bikedone.usermanagement.dto.response.SignupResponse;
import com.bikedone.usermanagement.entity.RefreshToken;
import com.bikedone.usermanagement.entity.Role;
import com.bikedone.usermanagement.entity.User;
import com.bikedone.usermanagement.enums.RoleCode;
import com.bikedone.usermanagement.enums.UserStatus;
import com.bikedone.usermanagement.exception.BadRequestException;
import com.bikedone.usermanagement.mapper.UserMapper;
import com.bikedone.usermanagement.repository.RoleRepository;
import com.bikedone.usermanagement.repository.UserRepository;
import com.bikedone.usermanagement.security.jwt.JwtService;
import com.bikedone.usermanagement.security.token.RefreshTokenResult;
import com.bikedone.usermanagement.security.token.RefreshTokenService;
import com.bikedone.usermanagement.security.user.UserPrincipal;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;

    private final RoleRepository roleRepository;

    private final UserMapper userMapper;

    private final PasswordEncoder passwordEncoder;

    private final AuthenticationManager authenticationManager;

    private final JwtService jwtService;

    private final JwtProperties jwtProperties;

    private final RefreshTokenService refreshTokenService;

    @Override
    public SignupResponse signup(SignupRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        if (userRepository.existsByMobileNumber(request.getMobileNumber())) {
            throw new BadRequestException("Mobile number already exists");
        }

        Role role = roleRepository.findByRoleCode(RoleCode.CUSTOMER)
                .orElseThrow(() -> new BadRequestException("Customer role not found"));

        User user = userMapper.toEntity(request);

        user.setRole(role);
        user.setStatus(UserStatus.ACTIVE);
        user.setEmailVerified(false);
        user.setMobileVerified(false);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        User savedUser = userRepository.save(user);

        return userMapper.toResponse(savedUser);
    }

    @Override
    public LoginResponse login(LoginRequest request) {

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                request.getEmail(),
                                request.getPassword()
                        )
                );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        User user = userRepository.findUserWithRoleByEmail(principal.getUsername())
                .orElseThrow(() -> new BadRequestException("User not found"));

        // Generate Access Token
        String accessToken = jwtService.generateToken(principal);

        // Generate & Save Refresh Token
        RefreshTokenResult refreshTokenResult =
                refreshTokenService.createRefreshToken(user);

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenResult.getRawToken())
                .tokenType(SecurityConstants.TOKEN_TYPE)
                .accessTokenExpiresIn(jwtProperties.getAccessTokenExpiration())
                .refreshTokenExpiresIn(jwtProperties.getRefreshTokenExpiration())
                .user(userMapper.toLoginResponse(user))
                .build();
    }

    @Override
    public LoginResponse refresh(RefreshTokenRequest request) {

        // Validate old refresh token
        RefreshToken existingRefreshToken =
                refreshTokenService.validateRefreshToken(
                        request.getRefreshToken()
                );

        User user = existingRefreshToken.getUser();

        // Build principal
        UserPrincipal principal = new UserPrincipal(user);

        // Generate new access token
        String accessToken =
                jwtService.generateToken(principal);

        // Revoke old refresh token
        refreshTokenService.revokeToken(existingRefreshToken);

        // Generate new refresh token
        RefreshTokenResult refreshTokenResult =
                refreshTokenService.createRefreshToken(user);

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenResult.getRawToken())
                .tokenType(SecurityConstants.TOKEN_TYPE)
                .accessTokenExpiresIn(jwtProperties.getAccessTokenExpiration())
                .refreshTokenExpiresIn(jwtProperties.getRefreshTokenExpiration())
                .user(userMapper.toLoginResponse(user))
                .build();
    }

}