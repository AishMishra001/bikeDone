package com.bikedone.usermanagement.security.user;

import com.bikedone.usermanagement.entity.User;
import com.bikedone.usermanagement.exception.ResourceNotFoundException;
import com.bikedone.usermanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        User user = userRepository.findUserWithRoleByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found with email : " + email));

        return new UserPrincipal(user);

    }

}