CREATE TABLE refresh_tokens
(
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    token_hash VARCHAR(500) NOT NULL UNIQUE,
    device_id VARCHAR(255),
    device_name VARCHAR(255),
    ip_address VARCHAR(100),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    last_used_at TIMESTAMP,
    revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_refresh_token_user
        FOREIGN KEY (user_id)
            REFERENCES users(id)
);

CREATE INDEX idx_refresh_token_user
    ON refresh_tokens(user_id);

CREATE INDEX idx_refresh_token_token_hash
    ON refresh_tokens(token_hash);

CREATE INDEX idx_refresh_token_revoked
    ON refresh_tokens(revoked);