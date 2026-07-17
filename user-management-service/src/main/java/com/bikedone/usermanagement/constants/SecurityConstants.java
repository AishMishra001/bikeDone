package com.bikedone.usermanagement.constants;

public final class SecurityConstants {

    private SecurityConstants() {
    }

    /**
     * Public URLs
     */
    public static final String[] PUBLIC_URLS = {
            "/api/v1/auth/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/v3/api-docs/**",
            "/actuator/**"
    };

    /**
     * Token
     */
    public static final String TOKEN_TYPE = "Bearer";

    /**
     * Header
     */
    public static final String AUTHORIZATION_HEADER = "Authorization";

    public static final String BEARER_PREFIX = "Bearer ";

}