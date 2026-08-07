CREATE TABLE service_categories (
    id                  BIGSERIAL PRIMARY KEY,
    category_code       VARCHAR(50) NOT NULL UNIQUE,
    display_name        VARCHAR(100) NOT NULL,
    icon_url            VARCHAR(500),
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO service_categories (category_code, display_name)
VALUES
    ('ENGINE','Engine'),
    ('BRAKES','Brakes'),
    ('ELECTRICAL','Electrical'),
    ('BATTERY','Battery'),
    ('TYRES','Tyres'),
    ('SUSPENSION','Suspension'),
    ('GENERAL','General');