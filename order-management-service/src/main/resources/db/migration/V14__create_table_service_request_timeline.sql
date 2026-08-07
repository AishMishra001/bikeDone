CREATE TABLE service_request_timeline
(
    id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),

    service_request_id UUID         NOT NULL,

    status             VARCHAR(50)  NOT NULL,

    remarks            VARCHAR(500),

    created_by         UUID,

    created_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    last_modified_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_timeline_request
        FOREIGN KEY (service_request_id)
            REFERENCES service_requests (id)
            ON DELETE CASCADE
);
