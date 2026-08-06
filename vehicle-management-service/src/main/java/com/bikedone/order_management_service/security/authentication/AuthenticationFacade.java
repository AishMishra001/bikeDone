package com.bikedone.order_management_service.security.authentication;

import com.bikedone.order_management_service.security.model.JwtUser;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class AuthenticationFacade {

    public JwtUser getCurrentUser() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        return (JwtUser) authentication.getPrincipal();
    }

    public UUID getCurrentUserId() {
        return getCurrentUser().getUserId();
    }

    public String getCurrentUserEmail() {
        return getCurrentUser().getEmail();
    }

    public String getCurrentUserRole() {
        return getCurrentUser().getRole();
    }
}