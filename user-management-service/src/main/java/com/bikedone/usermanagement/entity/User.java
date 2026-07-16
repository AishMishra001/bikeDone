package com.bikedone.usermanagement.entity;

import com.bikedone.usermanagement.enums.UserStatus;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(unique = true)
    private String email;

    @Column(name = "mobile_number", unique = true)
    private String mobileNumber;

    private String password;

    @Enumerated(EnumType.STRING)
    private UserStatus status;

    @Column(name = "email_verified")
    private Boolean emailVerified;

    @Column(name = "mobile_verified")
    private Boolean mobileVerified;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id")
    private Role role;

    @Column(name = "is_deleted", nullable = false)
    private Boolean deleted = false;

}