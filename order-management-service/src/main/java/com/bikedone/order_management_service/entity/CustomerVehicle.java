package com.bikedone.order_management_service.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
        name = "customer_vehicles",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_registration_number",
                        columnNames = "registration_number"
                ),
                @UniqueConstraint(
                        name = "uk_engine_number",
                        columnNames = "engine_number"
                ),
                @UniqueConstraint(
                        name = "uk_chassis_number",
                        columnNames = "chassis_number"
                )
        }
)
public class CustomerVehicle extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private java.util.UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", nullable = false)
    private VehicleBrand brand;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_id", nullable = false)
    private VehicleModel model;

    @Column(name = "registration_number", nullable = false, length = 20)
    private String registrationNumber;

    @Column(name = "manufacturing_year")
    private Integer manufacturingYear;

    @Column(name = "color", length = 50)
    private String color;

    @Column(name = "engine_number", length = 100)
    private String engineNumber;

    @Column(name = "chassis_number", length = 100)
    private String chassisNumber;

    @Column(name = "odometer_km", nullable = false)
    private Integer odometerKm = 0;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}