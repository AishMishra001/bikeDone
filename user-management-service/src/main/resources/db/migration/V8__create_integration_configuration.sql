CREATE TABLE integration_configuration
(
    id UUID PRIMARY KEY,

    provider VARCHAR(50) NOT NULL,

    configuration_name VARCHAR(100) NOT NULL,

    configuration JSONB NOT NULL,

    description TEXT,

    is_active BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL,

    updated_at TIMESTAMP NOT NULL,

    CONSTRAINT uk_provider_name UNIQUE(provider, configuration_name)
);