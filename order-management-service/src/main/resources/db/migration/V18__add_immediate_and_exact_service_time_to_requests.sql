ALTER TABLE service_requests
    ADD COLUMN is_immediate BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN preferred_service_time TIME;
