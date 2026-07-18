CREATE TABLE password_reset_tokens
(
    id UUID PRIMARY KEY,

    user_id UUID NOT NULL,

    token_hash VARCHAR(255) NOT NULL,

    expires_at TIMESTAMP NOT NULL,

    used_at TIMESTAMP,

    created_at TIMESTAMP NOT NULL,

    CONSTRAINT fk_password_reset_user
        FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE
);

CREATE INDEX idx_password_reset_token_hash
    ON password_reset_tokens(token_hash);

CREATE INDEX idx_password_reset_user
    ON password_reset_tokens(user_id);