CREATE TABLE mobile_verification_otp
(
    id              UUID PRIMARY KEY,

    user_id         UUID NOT NULL UNIQUE,

    mobile_number   VARCHAR(15) NOT NULL,

    otp_hash        VARCHAR(255) NOT NULL,

    attempts        INTEGER NOT NULL DEFAULT 0,

    expires_at      TIMESTAMP NOT NULL,

    verified_at     TIMESTAMP,

    created_at      TIMESTAMP NOT NULL,

    updated_at      TIMESTAMP,

    CONSTRAINT fk_mobile_verification_otp_user
        FOREIGN KEY (user_id)
            REFERENCES users (id)
            ON DELETE CASCADE
);

CREATE INDEX idx_mobile_verification_otp_user_id
    ON mobile_verification_otp(user_id);

CREATE INDEX idx_mobile_verification_otp_mobile
    ON mobile_verification_otp(mobile_number);