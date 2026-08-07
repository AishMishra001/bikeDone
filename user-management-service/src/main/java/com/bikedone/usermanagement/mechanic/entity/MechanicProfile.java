package com.bikedone.usermanagement.mechanic.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "mechanic_profiles")
public class MechanicProfile extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mechanic_id", nullable = false, unique = true)
    private MechanicUser mechanic;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "experience")
    private String experience;

    @Column(name = "profile_photo_url")
    private String profilePhotoUrl;

    @Column(name = "has_shop", nullable = false)
    private Boolean hasShop = true;

    @Column(name = "shop_name")
    private String shopName;

    @Column(name = "shop_address", columnDefinition = "TEXT")
    private String shopAddress;

    @Column(name = "service_radius_km")
    private Integer serviceRadiusKm = 10;
}
