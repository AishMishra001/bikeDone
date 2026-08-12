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
        name = "vehicle_models",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_brand_model",
                        columnNames = {"brand_id", "model_name"}
                ),
                @UniqueConstraint(
                        name = "uk_brand_model_code",
                        columnNames = {"brand_id", "model_code"}
                )
        }
)
public class VehicleModel extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", nullable = false)
    private VehicleBrand brand;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private Item item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fuel_type_id", nullable = false)
    private FuelType fuelType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transmission_type_id", nullable = false)
    private TransmissionType transmissionType;

    @Column(name = "model_name", nullable = false, length = 100)
    private String modelName;

    @Column(name = "model_code", nullable = false, length = 50)
    private String modelCode;

    @Column(name = "engine_capacity_cc")
    private Integer engineCapacityCc;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}