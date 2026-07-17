CREATE TABLE roles
(
    id BIGSERIAL PRIMARY KEY,
    role_code VARCHAR(30) NOT NULL UNIQUE,
    role_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO roles(role_code, role_name)
VALUES
    ('CUSTOMER','Customer'),
    ('MECHANIC','Mechanic'),
    ('ADMIN','Administrator');