package com.bikedone.usermanagement.repository;

import com.bikedone.usermanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    @Query("""
        SELECT u
        FROM User u
        JOIN FETCH u.role
        WHERE u.email=:email
""")
    Optional<User> findUserWithRoleByEmail(@Param("email") String email);

    Optional<User> findByMobileNumber(String mobileNumber);

    boolean existsByEmail(String email);

    boolean existsByMobileNumber(String mobileNumber);

}