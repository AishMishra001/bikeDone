package com.bikedone.usermanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "refresh_tokens",
    indexes = {
        @Index(name = "idx_refresh_token_user", columnList = "user_id"),
        @Index(name = "idx_refresh_token_token_hash", columnList = "token_hash"),
        @Index(name = "idx_refresh_token_revoked", columnList = "revoked")
    }
)
public class RefreshToken extends BaseEntity{

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "token_hash", nullable = false, unique = true, length = 500)
    private String tokenHash;

    @Column(name = "device_id")
    private String deviceId;

    @Column(name = "device_name")
    private String deviceName;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;

    @Column(name = "revoked", nullable = false)
    private Boolean revoked = false;

    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    public boolean isExpired(LocalDateTime currentTime) {
        return expiresAt.isBefore(currentTime);
    }

    public boolean isActive(LocalDateTime currentTime) {
        return !revoked && !isExpired(currentTime);
    }

    public void revoke(LocalDateTime dateTime) {
        this.revoked = true;
        this.revokedAt = dateTime;
    }

    public void markAsUsed(LocalDateTime dateTime) {
        this.lastUsedAt = dateTime;
    }

}
