package com.bikedone.usermanagement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "user_addresses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAddress extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 50)
    private String label;

    @Column(name = "house_number", nullable = false)
    private String houseNumber;

    @Column(name = "building_name")
    private String buildingName;

    @Column(nullable = false)
    private String street;

    private String landmark;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private String country;

    @Column(nullable = false, length = 10)
    private String pincode;

    @Column(precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "is_default", nullable = false)
    @Builder.Default
    private Boolean defaultAddress = false;

    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private Boolean deleted = false;

    @Column(name = "receiver_name", length = 100)
    private String receiverName;

    @Column(name = "receiver_phone_number", length = 20)
    private String receiverPhoneNumber;
}