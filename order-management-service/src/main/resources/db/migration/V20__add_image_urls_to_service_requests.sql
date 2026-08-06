-- V20: Add image_urls column to service_requests
-- Stores a comma-separated list of Cloudinary image URLs uploaded by the customer.
-- Nullable because photos are optional.

ALTER TABLE service_requests
    ADD COLUMN image_urls TEXT;
