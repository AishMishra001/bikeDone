package com.bikedone.usermanagement.security.token;

import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@Component
public class TokenHasher {

    public String hash(String token) {

        try {

            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));

            StringBuilder builder = new StringBuilder();

            for (byte b : hash) {

                builder.append(String.format("%02x", b));

            }

            return builder.toString();

        } catch (NoSuchAlgorithmException e) {

            throw new RuntimeException("Unable to hash refresh token.", e);

        }

    }

}