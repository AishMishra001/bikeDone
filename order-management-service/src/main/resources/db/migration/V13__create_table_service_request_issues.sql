CREATE TABLE service_request_issues
(
    id                 UUID      PRIMARY KEY DEFAULT gen_random_uuid(),

    service_request_id UUID      NOT NULL,

    service_issue_id   BIGINT    NOT NULL,

    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    last_modified_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_request_issue_request
        FOREIGN KEY (service_request_id)
            REFERENCES service_requests (id)
            ON DELETE CASCADE,

    CONSTRAINT fk_request_issue_issue
        FOREIGN KEY (service_issue_id)
            REFERENCES service_issues (id)
);
