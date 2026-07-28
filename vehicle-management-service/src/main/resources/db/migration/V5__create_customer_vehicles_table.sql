CREATE TABLE customer_vehicles
(
    id UUID PRIMARY KEY,

    user_id UUID NOT NULL,

    brand_id UUID NOT NULL,

    model_id UUID NOT NULL,

    registration_number VARCHAR(20) NOT NULL,

    manufacturing_year SMALLINT,

    color VARCHAR(50),

    engine_number VARCHAR(100),

    chassis_number VARCHAR(100),

    odometer_km INTEGER NOT NULL DEFAULT 0,

    is_default BOOLEAN NOT NULL DEFAULT FALSE,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL,
    created_by UUID,

    last_modified_at TIMESTAMP,
    last_modified_by UUID,

    CONSTRAINT fk_customer_vehicle_brand
        FOREIGN KEY (brand_id)
            REFERENCES vehicle_brands(id),

    CONSTRAINT fk_customer_vehicle_model
        FOREIGN KEY (model_id)
            REFERENCES vehicle_models(id),

    CONSTRAINT uk_registration_number
        UNIQUE(registration_number),

    CONSTRAINT uk_engine_number
        UNIQUE(engine_number),

    CONSTRAINT uk_chassis_number
        UNIQUE(chassis_number)
);

CREATE INDEX idx_customer_vehicle_user
    ON customer_vehicles(user_id);

CREATE INDEX idx_customer_vehicle_brand
    ON customer_vehicles(brand_id);

CREATE INDEX idx_customer_vehicle_model
    ON customer_vehicles(model_id);
