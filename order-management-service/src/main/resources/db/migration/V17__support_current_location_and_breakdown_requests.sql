ALTER TABLE service_requests
    ALTER COLUMN address_id DROP NOT NULL,
    ALTER COLUMN preferred_service_date DROP NOT NULL,
    ALTER COLUMN service_slot_id DROP NOT NULL,
    ADD COLUMN current_location_latitude DECIMAL(10, 8),
    ADD COLUMN current_location_longitude DECIMAL(11, 8),
    ADD COLUMN current_location_note VARCHAR(1000);
