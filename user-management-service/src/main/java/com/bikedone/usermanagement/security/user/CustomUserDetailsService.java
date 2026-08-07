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
    private final com.bikedone.usermanagement.mechanic.repository.MechanicUserRepository mechanicUserRepository;

    @Override
    public UserDetails loadUserByUsername(String identifier)
            throws UsernameNotFoundException {

        // 1. Try finding regular user by email
        var optionalUser = userRepository.findUserWithRoleByEmail(identifier);
        if (optionalUser.isPresent()) {
            return new UserPrincipal(optionalUser.get());
        }

        // 2. Try finding mechanic user by mobile number
        var optionalMechanic = mechanicUserRepository.findByMobileNumber(identifier);
        if (optionalMechanic.isPresent()) {
            return new UserPrincipal(optionalMechanic.get());
        }

        throw new UsernameNotFoundException("User/Mechanic not found with identifier : " + identifier);
    }
}