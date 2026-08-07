CREATE TABLE fuel_types
(
    id UUID PRIMARY KEY,

    code VARCHAR(30) NOT NULL UNIQUE,

    display_name VARCHAR(50) NOT NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL,
    created_by UUID,

    last_modified_at TIMESTAMP,
    last_modified_by UUID
);

INSERT INTO fuel_types
(id, code, display_name, is_active, created_at, last_modified_at)
VALUES
    (gen_random_uuid(), 'PETROL', 'Petrol', true, NOW(), NOW()),
    (gen_random_uuid(), 'DIESEL', 'Diesel', true, NOW(), NOW()),
    (gen_random_uuid(), 'ELECTRIC', 'Electric', true, NOW(), NOW()),
    (gen_random_uuid(), 'CNG', 'CNG', true, NOW(), NOW()),
    (gen_random_uuid(), 'HYBRID', 'Hybrid', true, NOW(), NOW());
