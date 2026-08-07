package com.bikedone.usermanagement.mechanic.entity;

import com.bikedone.usermanagement.enums.UserStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "mechanics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MechanicUser extends BaseEntity {

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(unique = true)
    private String email;

    @Column(name = "mobile_number", nullable = false, unique = true)
    private String mobileNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status;

    @Builder.Default
    @Column(name = "mobile_verified", nullable = false)
    private Boolean mobileVerified = false;

    @Builder.Default
    @Column(name = "is_blocked", nullable = false)
    private Boolean blocked = false;

    @Builder.Default
    @Column(name = "is_deleted", nullable = false)
    private Boolean deleted = false;
}
