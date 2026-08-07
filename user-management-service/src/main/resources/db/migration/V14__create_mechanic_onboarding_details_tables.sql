-- Create mechanic_profiles (Basic Details, Shop Details, Radius, etc.)
CREATE TABLE mechanic_profiles
(
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mechanic_id         UUID NOT NULL UNIQUE,
    full_name           VARCHAR(150),
    experience          VARCHAR(50),
    profile_photo_url   VARCHAR(500),
    has_shop            BOOLEAN NOT NULL DEFAULT TRUE,
    shop_name           VARCHAR(200),
    shop_address        TEXT,
    service_radius_km   INTEGER DEFAULT 10,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_mechanic_profiles_mechanic
        FOREIGN KEY (mechanic_id)
            REFERENCES mechanics (id)
            ON DELETE CASCADE
);

-- Create mechanic_services (Service categories offered by mechanic)
CREATE TABLE mechanic_services
(
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mechanic_id     UUID NOT NULL,
    service_name    VARCHAR(100) NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_mechanic_services_mechanic
        FOREIGN KEY (mechanic_id)
            REFERENCES mechanics (id)
            ON DELETE CASCADE,

    CONSTRAINT uq_mechanic_service
        UNIQUE (mechanic_id, service_name)
);

-- Create mechanic_documents (Aadhaar, PAN, DL, Shop Photo, etc.)
CREATE TABLE mechanic_documents
(
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mechanic_id     UUID NOT NULL,
    document_type   VARCHAR(50) NOT NULL, -- AADHAAR, PAN, DRIVING_LICENSE, SHOP_PHOTO, PROFILE_PHOTO
    document_number VARCHAR(100),
    document_url    VARCHAR(500) NOT NULL,
    verification_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_mechanic_documents_mechanic
        FOREIGN KEY (mechanic_id)
            REFERENCES mechanics (id)
            ON DELETE CASCADE,

    CONSTRAINT uq_mechanic_document_type
        UNIQUE (mechanic_id, document_type)
);

-- Create mechanic_bank_details (Bank Account Info for payout)
CREATE TABLE mechanic_bank_details
(
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mechanic_id         UUID NOT NULL UNIQUE,
    account_holder_name VARCHAR(150) NOT NULL,
    account_number      VARCHAR(50) NOT NULL,
    ifsc_code           VARCHAR(20) NOT NULL,
    bank_name           VARCHAR(100) NOT NULL,
    is_verified         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_mechanic_bank_mechanic
        FOREIGN KEY (mechanic_id)
            REFERENCES mechanics (id)
            ON DELETE CASCADE
);
