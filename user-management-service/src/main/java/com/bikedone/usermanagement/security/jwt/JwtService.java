package com.bikedone.usermanagement.security.jwt;

import com.bikedone.usermanagement.config.JwtProperties;
import com.bikedone.usermanagement.security.user.UserPrincipal;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final JwtProperties jwtProperties;

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtProperties.getSecret());
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(UserPrincipal userPrincipal) {

        Date now = new Date();

        Date expiry = new Date(now.getTime() + jwtProperties.getAccessTokenExpiration());

        return Jwts.builder()
                .issuer("BikeDone")
                .subject(userPrincipal.getUsername())
                .claim("userId", userPrincipal.getId())
                .claim("role",
                        userPrincipal.getAuthorities()
                                .iterator()
                                .next()
                                .getAuthority())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(getSigningKey())
                .compact();

    }

    public String extractUsername(String token) {

        return extractAllClaims(token).getSubject();

    }

    private Claims extractAllClaims(String token) {

        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

    }

    public Long getExpiration() {
        return jwtProperties.getAccessTokenExpiration();
    }

    public boolean isTokenExpired(String token) {

        return extractAllClaims(token)
                .getExpiration()
                .before(new Date());

    }

    public boolean validateToken(String token, UserPrincipal userPrincipal) {

        String username = extractUsername(token);

        return username.equals(userPrincipal.getUsername())
                && !isTokenExpired(token);

    }
}