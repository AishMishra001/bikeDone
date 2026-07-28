package com.bikedone.vehicle_management_service.security.jwt;

import com.bikedone.vehicle_management_service.security.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final JwtProperties jwtProperties;

    private SecretKey getSigningKey() {

        byte[] keyBytes =
                Decoders.BASE64.decode(jwtProperties.getSecret());

        return Keys.hmacShaKeyFor(keyBytes);

    }

    private Claims extractAllClaims(String token) {

        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

    }

    public UUID extractUserId(String token) {

        String userId =
                extractAllClaims(token)
                        .get("userId", String.class);

        return UUID.fromString(userId);

    }

    public String extractEmail(String token) {

        return extractAllClaims(token)
                .getSubject();

    }

    public String extractRole(String token) {

        return extractAllClaims(token)
                .get("role", String.class);

    }

    public boolean isTokenExpired(String token) {

        return extractAllClaims(token)
                .getExpiration()
                .before(new Date());

    }

    public boolean validateToken(String token) {

        return !isTokenExpired(token);

    }

}