package com.bikedone.usermanagement.security.authentication;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class RefreshTokenRequestResolverTest {

    private final RefreshTokenRequestResolver resolver = new RefreshTokenRequestResolver();

    @Test
    void shouldPreferRequestTokenOverCookie() {
        String resolved = resolver.resolveRefreshToken("body-token", "cookie-token");

        assertEquals("body-token", resolved);
    }

    @Test
    void shouldFallbackToCookieWhenRequestTokenIsMissing() {
        String resolved = resolver.resolveRefreshToken("   ", "cookie-token");

        assertEquals("cookie-token", resolved);
    }

    @Test
    void shouldReturnNullWhenNoTokenIsAvailable() {
        String resolved = resolver.resolveRefreshToken(null, null);

        assertNull(resolved);
    }
}
