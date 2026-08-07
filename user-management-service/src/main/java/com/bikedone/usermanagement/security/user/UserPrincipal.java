package com.bikedone.usermanagement.security.user;

import com.bikedone.usermanagement.entity.User;
import com.bikedone.usermanagement.mechanic.entity.MechanicUser;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Getter
public class UserPrincipal implements UserDetails {

    private final UUID id;

    private final String email;

    private final String password;

    private final boolean enabled;

    private final MechanicUser mechanicUser;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.password = user.getPassword();
        this.enabled = "ACTIVE".equals(user.getStatus().name());
        this.mechanicUser = null;
        this.authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + user.getRole().getRoleCode().name())
        );
    }

    public UserPrincipal(MechanicUser mechanic) {
        this.id = mechanic.getId();
        this.email = mechanic.getMobileNumber();
        this.password = "";
        this.enabled = true;
        this.mechanicUser = mechanic;
        this.authorities = List.of(
                new SimpleGrantedAuthority("ROLE_MECHANIC")
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return enabled;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}