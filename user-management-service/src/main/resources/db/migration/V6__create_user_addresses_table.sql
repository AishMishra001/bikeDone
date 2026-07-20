CREATE TABLE user_addresses
(
    id                 UUID PRIMARY KEY,
    user_id            UUID         NOT NULL,
    label              VARCHAR(50)  NOT NULL,
    house_number       VARCHAR(100) NOT NULL,
    building_name      VARCHAR(255),
    street             VARCHAR(255) NOT NULL,
    landmark           VARCHAR(255),
    city               VARCHAR(100) NOT NULL,
    state              VARCHAR(100) NOT NULL,
    country            VARCHAR(100) NOT NULL,
    pincode            VARCHAR(10)  NOT NULL,
    latitude           DECIMAL(10, 8),
    longitude          DECIMAL(11, 8),
    is_default         BOOLEAN      NOT NULL DEFAULT FALSE,
    is_deleted         BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at         TIMESTAMP    NOT NULL,
    updated_at         TIMESTAMP,
    CONSTRAINT fk_user_addresses_user
        FOREIGN KEY (user_id)
            REFERENCES users (id)
);

CREATE INDEX idx_user_addresses_user_id
    ON user_addresses (user_id);

CREATE INDEX idx_user_addresses_user_default
    ON user_addresses (user_id, is_default);