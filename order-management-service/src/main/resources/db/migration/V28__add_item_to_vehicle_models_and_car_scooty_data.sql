ALTER TABLE vehicle_models
    ADD COLUMN item_id UUID REFERENCES items(id);

-- Update existing models (Splendor, Pulsar, Apache, etc.) as BIKE item dynamically
UPDATE vehicle_models
SET item_id = (SELECT id FROM items WHERE item_code = 'BIKE' LIMIT 1)
WHERE item_id IS NULL;

-- Insert Car Brands into vehicle_brands (if not exists)
INSERT INTO vehicle_brands (id, brand_name, brand_code, is_active, created_at)
VALUES
    (gen_random_uuid(), 'Maruti Suzuki', 'MARUTI_SUZUKI', TRUE, NOW()),
    (gen_random_uuid(), 'Hyundai', 'HYUNDAI', TRUE, NOW()),
    (gen_random_uuid(), 'Tata', 'TATA', TRUE, NOW()),
    (gen_random_uuid(), 'Mahindra', 'MAHINDRA', TRUE, NOW()),
    (gen_random_uuid(), 'Toyota', 'TOYOTA', TRUE, NOW())
ON CONFLICT (brand_code) DO NOTHING;

-- Insert Scooty Models for existing brands (Honda, TVS, Suzuki, Hero, Bajaj)
INSERT INTO vehicle_models
(id, brand_id, item_id, model_name, model_code, fuel_type_id, transmission_type_id, engine_capacity_cc, is_active, created_at)
SELECT
    gen_random_uuid(),
    vb.id,
    (SELECT id FROM items WHERE item_code = 'SCOOTY' LIMIT 1),
    data.model_name,
    data.model_code,
    (SELECT id FROM fuel_types WHERE code = 'PETROL' LIMIT 1),
    (SELECT id FROM transmission_types WHERE code = 'AUTOMATIC' LIMIT 1),
    data.cc,
    TRUE,
    NOW()
FROM (
    VALUES
        ('HONDA', 'Activa 6G', 'ACTIVA_6G', 110),
        ('HONDA', 'Dio', 'DIO', 110),
        ('HONDA', 'Activa 125', 'ACTIVA_125', 124),
        ('TVS', 'Jupiter', 'JUPITER', 110),
        ('TVS', 'Ntorq 125', 'NTORQ_125', 124),
        ('SUZUKI', 'Access 125', 'ACCESS_125', 124),
        ('SUZUKI', 'Burgman Street', 'BURGMAN_STREET', 124),
        ('HERO', 'Pleasure Plus', 'PLEASURE_PLUS', 110),
        ('HERO', 'Maestro Edge 125', 'MAESTRO_EDGE_125', 124),
        ('BAJAJ', 'Chetak EV', 'CHETAK_EV', 0)
) AS data(brand_code, model_name, model_code, cc)
JOIN vehicle_brands vb ON vb.brand_code = data.brand_code
ON CONFLICT DO NOTHING;

-- Insert Car Models for Maruti, Hyundai, Tata, Mahindra, Toyota
INSERT INTO vehicle_models
(id, brand_id, item_id, model_name, model_code, fuel_type_id, transmission_type_id, engine_capacity_cc, is_active, created_at)
SELECT
    gen_random_uuid(),
    vb.id,
    (SELECT id FROM items WHERE item_code = 'CAR' LIMIT 1),
    data.model_name,
    data.model_code,
    (SELECT id FROM fuel_types WHERE code = 'PETROL' LIMIT 1),
    (SELECT id FROM transmission_types WHERE code = 'MANUAL' LIMIT 1),
    data.cc,
    TRUE,
    NOW()
FROM (
    VALUES
        ('MARUTI_SUZUKI', 'Swift', 'SWIFT', 1197),
        ('MARUTI_SUZUKI', 'Baleno', 'BALENO', 1197),
        ('MARUTI_SUZUKI', 'Brezza', 'BREZZA', 1462),
        ('HYUNDAI', 'Creta', 'CRETA', 1497),
        ('HYUNDAI', 'i20', 'I20', 1197),
        ('HYUNDAI', 'Venue', 'VENUE', 1197),
        ('TATA', 'Nexon', 'NEXON', 1199),
        ('TATA', 'Punch', 'PUNCH', 1199),
        ('MAHINDRA', 'Thar', 'THAR', 1997),
        ('MAHINDRA', 'XUV700', 'XUV700', 1997),
        ('TOYOTA', 'Innova Crysta', 'INNOVA_CRYSTA', 2393)
) AS data(brand_code, model_name, model_code, cc)
JOIN vehicle_brands vb ON vb.brand_code = data.brand_code
ON CONFLICT DO NOTHING;

CREATE INDEX idx_vehicle_models_item ON vehicle_models(item_id);
