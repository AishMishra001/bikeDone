package com.bikedone.usermanagement.security.authentication;

public class RefreshTokenRequestResolver {

    public String resolveRefreshToken(String requestToken, String cookieToken) {
        if (requestToken != null && !requestToken.trim().isEmpty()) {
            return requestToken;
        }
        if (cookieToken != null && !cookieToken.trim().isEmpty()) {
            return cookieToken;
        }
        return null;
    }
}
