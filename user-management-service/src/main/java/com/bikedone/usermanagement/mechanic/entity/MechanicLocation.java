package com.bikedone.usermanagement.mechanic.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "mechanic_locations")
public class MechanicLocation extends BaseEntity {

    @Column(name = "mechanic_id", nullable = false, unique = true)
    private UUID mechanicId;

    @Column(name = "latitude", precision = 10, scale = 8, nullable = false)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 11, scale = 8, nullable = false)
    private BigDecimal longitude;

    @Column(name = "is_online", nullable = false)
    @Builder.Default
    private Boolean isOnline = true;

    @Column(name = "is_busy", nullable = false)
    @Builder.Default
    private Boolean isBusy = false;

    @Column(name = "last_updated_at", nullable = false)
    private LocalDateTime lastUpdatedAt;
}
