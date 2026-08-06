CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE service_slots (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_name        VARCHAR(50) NOT NULL,
    start_time       TIME NOT NULL,
    end_time         TIME NOT NULL,
    max_capacity     INTEGER NOT NULL DEFAULT 50,
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO service_slots (slot_name, start_time, end_time, max_capacity)
VALUES
    ('09 AM - 11 AM', '09:00', '11:00', 50),
    ('11 AM - 01 PM', '11:00', '13:00', 50),
    ('01 PM - 03 PM', '13:00', '15:00', 50),
    ('03 PM - 05 PM', '15:00', '17:00', 50);
