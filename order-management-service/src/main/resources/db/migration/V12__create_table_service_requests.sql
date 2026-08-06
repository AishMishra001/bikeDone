CREATE TABLE service_requests
(
    id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

    request_number         VARCHAR(30) NOT NULL UNIQUE,

    customer_id            UUID        NOT NULL,

    customer_vehicle_id    UUID        NOT NULL,

    address_id             UUID        NOT NULL,

    request_type_id        BIGINT      NOT NULL,

    preferred_service_date DATE        NOT NULL,

    service_slot_id        UUID        NOT NULL,

    is_issue_identified    BOOLEAN     NOT NULL DEFAULT TRUE,

    description            TEXT,

    status                 VARCHAR(50) NOT NULL DEFAULT 'REQUEST_CREATED',

    is_active              BOOLEAN     NOT NULL DEFAULT TRUE,

    created_at             TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    last_modified_at       TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_service_request_request_type
        FOREIGN KEY (request_type_id)
            REFERENCES request_types (id),

    CONSTRAINT fk_service_request_service_slot
        FOREIGN KEY (service_slot_id)
            REFERENCES service_slots (id)
);

CREATE INDEX idx_service_request_customer ON service_requests (customer_id);
CREATE INDEX idx_service_request_vehicle  ON service_requests (customer_vehicle_id);
CREATE INDEX idx_service_request_status   ON service_requests (status);
CREATE INDEX idx_service_request_date     ON service_requests (preferred_service_date);
