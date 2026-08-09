CREATE TABLE chat_messages (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    last_modified_at TIMESTAMP,
    request_id UUID NOT NULL,
    sender_id VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    timestamp_ms BIGINT NOT NULL,
    
    CONSTRAINT fk_chat_messages_request FOREIGN KEY (request_id) REFERENCES service_requests (id)
);

CREATE INDEX idx_chat_messages_request_id ON chat_messages(request_id);
