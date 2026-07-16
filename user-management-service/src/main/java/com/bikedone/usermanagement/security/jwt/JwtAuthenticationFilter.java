package com.bikedone.usermanagement.security.jwt;

import com.bikedone.usermanagement.constants.SecurityConstants;
import com.bikedone.usermanagement.security.user.CustomUserDetailsService;
import com.bikedone.usermanagement.security.user.UserPrincipal;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    private final CustomUserDetailsService customUserDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        System.out.println("========== JWT FILTER HIT ==========");

        String authHeader =
                request.getHeader(SecurityConstants.AUTHORIZATION_HEADER);

        System.out.println(authHeader);

        if (authHeader == null ||
                !authHeader.startsWith(SecurityConstants.BEARER_PREFIX)) {

            filterChain.doFilter(request, response);
            return;

        }

        String jwt =
                authHeader.substring(
                        SecurityConstants.BEARER_PREFIX.length());

        System.out.println(jwt);

        String username =
                jwtService.extractUsername(jwt);

        System.out.println(username);

        if (username != null &&
                SecurityContextHolder.getContext().getAuthentication() == null) {

            UserPrincipal userPrincipal =
                    (UserPrincipal) customUserDetailsService
                            .loadUserByUsername(username);

            System.out.println(userPrincipal.getUsername());

            if (jwtService.validateToken(jwt, userPrincipal)) {

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userPrincipal,
                                null,
                                userPrincipal.getAuthorities());

                authentication.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request));

                SecurityContextHolder
                        .getContext()
                        .setAuthentication(authentication);

            }

        }

        filterChain.doFilter(request, response);

    }
}