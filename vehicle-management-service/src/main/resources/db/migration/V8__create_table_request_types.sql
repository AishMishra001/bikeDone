CREATE TABLE request_types (
   id                  BIGSERIAL PRIMARY KEY,
   request_type_code   VARCHAR(50) NOT NULL UNIQUE,
   display_name        VARCHAR(100) NOT NULL,
   description         VARCHAR(255),
   is_active           BOOLEAN NOT NULL DEFAULT TRUE,
   created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   last_modified_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO request_types (request_type_code, display_name, description)
VALUES
    ('ROUTINE_SERVICE', 'Routine Service', 'Regular bike servicing'),
    ('REPAIR', 'Repair', 'Bike repair request'),
    ('INSPECTION', 'Inspection', 'Vehicle inspection only'),
    ('BREAKDOWN', 'Breakdown Assistance', 'Emergency roadside assistance');