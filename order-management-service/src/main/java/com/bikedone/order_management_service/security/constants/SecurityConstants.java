package com.bikedone.order_management_service.security.constants;

public final class SecurityConstants {

    private SecurityConstants() {
    }

    public static final String AUTHORIZATION_HEADER = "Authorization";

    public static final String BEARER_PREFIX = "Bearer ";

    public static final String[] PUBLIC_URLS = {
            "/api/v1/auth/**",
            "/api/v1/service-requests/mechanics/**",
            "/api/v1/service-requests/*/accept",
            "/swagger-ui/**",
            "/v3/api-docs/**",
            "/swagger-ui.html",
            "/actuator/health"
    };
}