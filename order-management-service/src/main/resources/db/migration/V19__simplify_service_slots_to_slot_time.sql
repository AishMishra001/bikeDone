-- V19: Simplify service_slots table
-- Drop old range-based columns, add a single slot_time column.
-- Seed all 48 half-hourly slots from 12:00 AM to 11:30 PM.

-- 1. Remove old data (ranges no longer valid)
DELETE FROM service_slots;

-- 2. Drop obsolete columns
ALTER TABLE service_slots
    DROP COLUMN start_time,
    DROP COLUMN end_time,
    DROP COLUMN max_capacity;

-- 3. Add the new slot_time column
ALTER TABLE service_slots
    ADD COLUMN slot_time TIME NOT NULL;

-- 4. Add a unique constraint so we never get duplicate slots
ALTER TABLE service_slots
    ADD CONSTRAINT uq_service_slots_slot_time UNIQUE (slot_time);

-- 5. Seed all 48 half-hourly slots (12:00 AM → 11:30 PM)
INSERT INTO service_slots (slot_name, slot_time, is_active) VALUES
    ('12:00 AM', '00:00', TRUE),
    ('12:30 AM', '00:30', TRUE),
    ('01:00 AM', '01:00', TRUE),
    ('01:30 AM', '01:30', TRUE),
    ('02:00 AM', '02:00', TRUE),
    ('02:30 AM', '02:30', TRUE),
    ('03:00 AM', '03:00', TRUE),
    ('03:30 AM', '03:30', TRUE),
    ('04:00 AM', '04:00', TRUE),
    ('04:30 AM', '04:30', TRUE),
    ('05:00 AM', '05:00', TRUE),
    ('05:30 AM', '05:30', TRUE),
    ('06:00 AM', '06:00', TRUE),
    ('06:30 AM', '06:30', TRUE),
    ('07:00 AM', '07:00', TRUE),
    ('07:30 AM', '07:30', TRUE),
    ('08:00 AM', '08:00', TRUE),
    ('08:30 AM', '08:30', TRUE),
    ('09:00 AM', '09:00', TRUE),
    ('09:30 AM', '09:30', TRUE),
    ('10:00 AM', '10:00', TRUE),
    ('10:30 AM', '10:30', TRUE),
    ('11:00 AM', '11:00', TRUE),
    ('11:30 AM', '11:30', TRUE),
    ('12:00 PM', '12:00', TRUE),
    ('12:30 PM', '12:30', TRUE),
    ('01:00 PM', '13:00', TRUE),
    ('01:30 PM', '13:30', TRUE),
    ('02:00 PM', '14:00', TRUE),
    ('02:30 PM', '14:30', TRUE),
    ('03:00 PM', '15:00', TRUE),
    ('03:30 PM', '15:30', TRUE),
    ('04:00 PM', '16:00', TRUE),
    ('04:30 PM', '16:30', TRUE),
    ('05:00 PM', '17:00', TRUE),
    ('05:30 PM', '17:30', TRUE),
    ('06:00 PM', '18:00', TRUE),
    ('06:30 PM', '18:30', TRUE),
    ('07:00 PM', '19:00', TRUE),
    ('07:30 PM', '19:30', TRUE),
    ('08:00 PM', '20:00', TRUE),
    ('08:30 PM', '20:30', TRUE),
    ('09:00 PM', '21:00', TRUE),
    ('09:30 PM', '21:30', TRUE),
    ('10:00 PM', '22:00', TRUE),
    ('10:30 PM', '22:30', TRUE),
    ('11:00 PM', '23:00', TRUE),
    ('11:30 PM', '23:30', TRUE);
