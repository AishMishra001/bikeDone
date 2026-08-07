package com.bikedone.usermanagement.mechanic.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "mechanic_documents")
public class MechanicDocument extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mechanic_id", nullable = false)
    private MechanicUser mechanic;

    @Column(name = "document_type", nullable = false)
    private String documentType; // AADHAAR, PAN, DRIVING_LICENSE, SHOP_PHOTO, PROFILE_PHOTO

    @Column(name = "document_number")
    private String documentNumber;

    @Column(name = "document_url", nullable = false)
    private String documentUrl;

    @Column(name = "verification_status", nullable = false)
    private String verificationStatus = "PENDING";
}
