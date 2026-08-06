package com.bikedone.order_management_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "service_slots")
public class ServiceSlot extends BaseEntity {

    @Column(name = "slot_name", nullable = false)
    private String slotName;

    /** The exact time this slot represents, e.g. 09:00, 09:30, … 23:30 */
    @Column(name = "slot_time", nullable = false, unique = true)
    private LocalTime slotTime;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
