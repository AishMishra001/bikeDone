package com.bikedone.order_management_service.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
        name = "service_pricing_rules",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_item_request_type",
                        columnNames = {"item_id", "request_type_id"}
                )
        }
)
public class ServicePricingRule extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_type_id", nullable = false)
    private RequestType requestType;

    @Column(name = "base_charge", nullable = false, precision = 10, scale = 2)
    private BigDecimal baseCharge = BigDecimal.ZERO;

    @Column(name = "convenience_fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal convenienceFee = BigDecimal.ZERO;

    @Column(name = "platform_fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal platformFee = BigDecimal.ZERO;

    @Column(name = "gst_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal gstPercentage = new BigDecimal("18.00");

    @Column(name = "is_gst_inclusive", nullable = false)
    private Boolean isGstInclusive = false;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
