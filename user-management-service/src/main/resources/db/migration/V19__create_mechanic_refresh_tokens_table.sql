CREATE TABLE IF NOT EXISTS mechanic_refresh_tokens (
    id UUID PRIMARY KEY,
    mechanic_id UUID NOT NULL,
    token_hash VARCHAR(500) NOT NULL UNIQUE,
    device_id VARCHAR(255),
    device_name VARCHAR(255),
    ip_address VARCHAR(255),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    last_used_at TIMESTAMP,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    revoked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_mech_refresh_token_mechanic FOREIGN KEY (mechanic_id) REFERENCES mechanics(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_mech_refresh_token_user ON mechanic_refresh_tokens (mechanic_id);
CREATE INDEX IF NOT EXISTS idx_mech_refresh_token_token_hash ON mechanic_refresh_tokens (token_hash);
CREATE INDEX IF NOT EXISTS idx_mech_refresh_token_revoked ON mechanic_refresh_tokens (revoked);
