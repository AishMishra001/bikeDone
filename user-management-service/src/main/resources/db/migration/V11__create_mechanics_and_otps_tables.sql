CREATE TABLE mechanics
(
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    email           VARCHAR(255),
    mobile_number   VARCHAR(15) NOT NULL UNIQUE,
    status          VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    mobile_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_blocked      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP,
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE mechanic_otps
(
    id              UUID PRIMARY KEY,
    mechanic_id     UUID NOT NULL,
    mobile_number   VARCHAR(15) NOT NULL,
    otp_hash        VARCHAR(255) NOT NULL,
    attempts        INTEGER NOT NULL DEFAULT 0,
    expires_at      TIMESTAMP NOT NULL,
    verified_at     TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP,

    CONSTRAINT fk_mechanic_otps_mechanic
        FOREIGN KEY (mechanic_id)
            REFERENCES mechanics (id)
            ON DELETE CASCADE
);

CREATE INDEX idx_mechanic_otps_mechanic_id
    ON mechanic_otps(mechanic_id);

CREATE INDEX idx_mechanic_otps_mobile
    ON mechanic_otps(mobile_number);

ALTER TABLE mechanic_onboarding_journeys
    DROP CONSTRAINT IF EXISTS fk_journey_mechanic;

ALTER TABLE mechanic_onboarding_journeys
    ADD CONSTRAINT fk_journey_mechanic
        FOREIGN KEY (mechanic_id)
            REFERENCES mechanics (id)
            ON DELETE CASCADE;

