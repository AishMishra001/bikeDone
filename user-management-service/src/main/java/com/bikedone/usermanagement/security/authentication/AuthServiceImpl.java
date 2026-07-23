package com.bikedone.usermanagement.security.authentication;

import com.bikedone.usermanagement.common.logging.LogLevel;
import com.bikedone.usermanagement.common.logging.LogStep;
import com.bikedone.usermanagement.common.logging.Logger;
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
import com.bikedone.usermanagement.exception.EmailNotVerifiedException;
import com.bikedone.usermanagement.mapper.UserMapper;
import com.bikedone.usermanagement.repository.RoleRepository;
import com.bikedone.usermanagement.repository.UserRepository;
import com.bikedone.usermanagement.security.jwt.JwtService;
import com.bikedone.usermanagement.security.token.RefreshTokenResult;
import com.bikedone.usermanagement.security.token.RefreshTokenService;
import com.bikedone.usermanagement.security.user.UserPrincipal;
import com.bikedone.usermanagement.service.EmailVerificationService;
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

    private final EmailVerificationService emailVerificationService;

    @Override
    public SignupResponse signup(SignupRequest request) {

        Logger.printLog( LogLevel.INFO, LogStep.AUTH, "Signup request received", request.getEmail(), null, null );

        if (userRepository.existsByEmail(request.getEmail())) {
            Logger.printLog( LogLevel.WARN, LogStep.AUTH, "Signup failed", "Email already exists: " + request.getEmail(), null, null );
            throw new BadRequestException("Email already exists");
        }

        if (userRepository.existsByMobileNumber(request.getMobileNumber())) {
            Logger.printLog( LogLevel.WARN, LogStep.AUTH, "Signup failed", "Mobile number already exists: " + request.getMobileNumber(), null, null );
            throw new BadRequestException("Mobile number already exists");
        }

        Role role = roleRepository.findByRoleCode(RoleCode.CUSTOMER)
                .orElseThrow(() -> new BadRequestException("Customer role not found"));

        Logger.printLog( LogLevel.INFO, LogStep.AUTH, "Customer role fetched", "Role: " + role.getRoleCode().name(), null, null );

        User user = userMapper.toEntity(request);

        user.setRole(role);
        user.setStatus(UserStatus.ACTIVE);
        user.setEmailVerified(false);
        user.setMobileVerified(false);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        Logger.printLog( LogLevel.DEBUG, LogStep.AUTH, "Password encoded", request.getEmail(), null, null );

        User savedUser = userRepository.save(user);

        Logger.printLog( LogLevel.INFO, LogStep.AUTH, "Customer registered successfully", "Customer account created successfully", savedUser.getId().toString(), savedUser.getId().toString() );

        emailVerificationService.sendVerificationEmail(savedUser);

        Logger.printLog( LogLevel.INFO, LogStep.AUTH, "Verification email sent", "Email verification link sent successfully", savedUser.getId().toString(), null );

        Logger.printLog( LogLevel.INFO, LogStep.AUTH, "Signup completed successfully", "Response sent to client", savedUser.getId().toString(), null );

       return userMapper.toResponse(savedUser);
    }

    @Override
    public LoginResponse login(LoginRequest request) {

        Logger.printLog( LogLevel.INFO, LogStep.AUTH, "Login request received", request.getEmail(), null, null );

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                request.getEmail(),
                                request.getPassword()
                        )
                );

        Logger.printLog( LogLevel.INFO, LogStep.AUTH, "Authentication successful", "User credentials validated successfully", null, null );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        User user = userRepository.findUserWithRoleByEmail(principal.getUsername())
                .orElseThrow(() -> new BadRequestException("User not found"));

        Logger.printLog( LogLevel.INFO, LogStep.AUTH, "User details fetched", "Authenticated user loaded from database", user.getId().toString(), null );

        if (!Boolean.TRUE.equals(user.getEmailVerified())) {

            Logger.printLog(
                    LogLevel.WARN,
                    LogStep.AUTH,
                    "Login blocked",
                    "Email is not verified",
                    user.getId().toString(),
                    null
            );

            throw new EmailNotVerifiedException(
                    "Email is not verified. Please verify your email before logging in."
            );
        }

        Logger.printLog( LogLevel.INFO, LogStep.AUTH, "Email verification validated", "Email is verified", user.getId().toString(), null );

        // Generate Access Token
        String accessToken = jwtService.generateToken(principal);

        Logger.printLog( LogLevel.DEBUG, LogStep.JWT, "Access token generated", "JWT access token generated successfully", user.getId().toString(), null );

        // Generate & Save Refresh Token
        RefreshTokenResult refreshTokenResult = refreshTokenService.createRefreshToken(user);

        Logger.printLog( LogLevel.DEBUG, LogStep.JWT, "Refresh token generated", "Refresh token created and persisted successfully", user.getId().toString(), null );

        Logger.printLog( LogLevel.INFO, LogStep.AUTH, "Login completed successfully", "Login response returned to client", user.getId().toString(), null );

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

        Logger.printLog( LogLevel.INFO, LogStep.JWT, "Refresh token request received", null, null, null );

        // Validate old refresh token
        RefreshToken existingRefreshToken =
                refreshTokenService.validateRefreshToken(
                        request.getRefreshToken()
                );

        User user = existingRefreshToken.getUser();

        Logger.printLog( LogLevel.INFO, LogStep.JWT, "Refresh token validated successfully", user.getEmail(), user.getId().toString(), existingRefreshToken.getId().toString() );

        // Build principal
        UserPrincipal principal = new UserPrincipal(user);

        // Generate new access token
        String accessToken =
                jwtService.generateToken(principal);

        // Revoke old refresh token
        refreshTokenService.revokeToken(existingRefreshToken);

        Logger.printLog( LogLevel.DEBUG, LogStep.JWT, "Old refresh token revoked", user.getEmail(), user.getId().toString(), existingRefreshToken.getId().toString() );

        // Generate new refresh token
        RefreshTokenResult refreshTokenResult =
                refreshTokenService.createRefreshToken(user);

        Logger.printLog( LogLevel.INFO, LogStep.JWT, "New refresh token generated successfully", user.getEmail(), user.getId().toString(), null );

        Logger.printLog( LogLevel.INFO, LogStep.AUTH, "Token refresh completed successfully", user.getEmail(), user.getId().toString(), null );

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