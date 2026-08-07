CREATE TABLE vehicle_models
(
    id UUID PRIMARY KEY,

    brand_id UUID NOT NULL,

    fuel_type_id UUID NOT NULL,

    transmission_type_id UUID NOT NULL,

    model_name VARCHAR(100) NOT NULL,

    model_code VARCHAR(50),

    engine_capacity_cc INTEGER,

    logo_url VARCHAR(500),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL,
    created_by UUID,

    last_modified_at TIMESTAMP,
    last_modified_by UUID,

    CONSTRAINT fk_vehicle_model_brand
        FOREIGN KEY (brand_id)
            REFERENCES vehicle_brands(id),

    CONSTRAINT fk_vehicle_model_fuel
        FOREIGN KEY (fuel_type_id)
            REFERENCES fuel_types(id),

    CONSTRAINT fk_vehicle_model_transmission
        FOREIGN KEY (transmission_type_id)
            REFERENCES transmission_types(id),

    CONSTRAINT uk_brand_model
        UNIQUE (brand_id, model_name)
);

CREATE INDEX idx_vehicle_model_brand
    ON vehicle_models(brand_id);
