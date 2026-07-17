package com.bikedone.usermanagement.entity;

import com.bikedone.usermanagement.enums.RoleCode;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "role_code",nullable = false, unique = true)
    private RoleCode roleCode;

    @Column(name = "role_name", nullable = false)
    private String roleName;

    @Column(name = "is_deleted", nullable = false)
    private Boolean deleted = false;

    private String description;

}