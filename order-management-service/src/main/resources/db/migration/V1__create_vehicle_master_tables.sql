CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE vehicle_brands
(
    id                 UUID PRIMARY KEY,

    brand_name         VARCHAR(100) NOT NULL,
    brand_code         VARCHAR(50) NOT NULL,

    logo_url           VARCHAR(500),

    is_active          BOOLEAN      NOT NULL DEFAULT TRUE,

    created_at         TIMESTAMP    NOT NULL,
    created_by         UUID,

    last_modified_at   TIMESTAMP,
    last_modified_by   UUID,

    CONSTRAINT uk_vehicle_brands_name UNIQUE (brand_name),
    CONSTRAINT uk_vehicle_brands_code UNIQUE (brand_code)
);

CREATE INDEX idx_vehicle_brands_name
    ON vehicle_brands (brand_name);

INSERT INTO vehicle_brands
(id, brand_name, brand_code, is_active, created_at)
VALUES
    (gen_random_uuid(), 'Hero', 'HERO', TRUE, NOW()),
    (gen_random_uuid(), 'Honda', 'HONDA', TRUE, NOW()),
    (gen_random_uuid(), 'TVS', 'TVS', TRUE, NOW()),
    (gen_random_uuid(), 'Bajaj', 'BAJAJ', TRUE, NOW()),
    (gen_random_uuid(), 'Yamaha', 'YAMAHA', TRUE, NOW()),
    (gen_random_uuid(), 'Suzuki', 'SUZUKI', TRUE, NOW()),
    (gen_random_uuid(), 'Royal Enfield', 'ROYAL_ENFIELD', TRUE, NOW()),
    (gen_random_uuid(), 'KTM', 'KTM', TRUE, NOW());