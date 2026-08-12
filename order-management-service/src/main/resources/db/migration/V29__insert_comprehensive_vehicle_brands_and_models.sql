-- =============================================================================
-- Migration V29: Insert Comprehensive Brands & Models for Bike, Scooty & Car
-- =============================================================================

-- 1. Insert Brands into vehicle_brands (if not exists)
INSERT INTO vehicle_brands (id, brand_name, brand_code, is_active, created_at)
VALUES
    (gen_random_uuid(), 'Hero MotoCorp', 'HERO', TRUE, NOW()),
    (gen_random_uuid(), 'Honda', 'HONDA', TRUE, NOW()),
    (gen_random_uuid(), 'TVS', 'TVS', TRUE, NOW()),
    (gen_random_uuid(), 'Bajaj', 'BAJAJ', TRUE, NOW()),
    (gen_random_uuid(), 'Royal Enfield', 'ROYAL_ENFIELD', TRUE, NOW()),
    (gen_random_uuid(), 'Yamaha', 'YAMAHA', TRUE, NOW()),
    (gen_random_uuid(), 'Suzuki', 'SUZUKI', TRUE, NOW()),
    (gen_random_uuid(), 'KTM', 'KTM', TRUE, NOW()),
    (gen_random_uuid(), 'Kawasaki', 'KAWASAKI', TRUE, NOW()),
    (gen_random_uuid(), 'Ather Energy', 'ATHER', TRUE, NOW()),
    (gen_random_uuid(), 'Ola Electric', 'OLA', TRUE, NOW()),
    (gen_random_uuid(), 'Maruti Suzuki', 'MARUTI_SUZUKI', TRUE, NOW()),
    (gen_random_uuid(), 'Hyundai', 'HYUNDAI', TRUE, NOW()),
    (gen_random_uuid(), 'Tata', 'TATA', TRUE, NOW()),
    (gen_random_uuid(), 'Mahindra', 'MAHINDRA', TRUE, NOW()),
    (gen_random_uuid(), 'Toyota', 'TOYOTA', TRUE, NOW()),
    (gen_random_uuid(), 'Kia', 'KIA', TRUE, NOW()),
    (gen_random_uuid(), 'Volkswagen', 'VOLKSWAGEN', TRUE, NOW()),
    (gen_random_uuid(), 'Skoda', 'SKODA', TRUE, NOW()),
    (gen_random_uuid(), 'MG Motor', 'MG', TRUE, NOW())
ON CONFLICT (brand_code) DO NOTHING;

-- 2. Insert BIKE Models
INSERT INTO vehicle_models
(id, brand_id, item_id, model_name, model_code, fuel_type_id, transmission_type_id, engine_capacity_cc, is_active, created_at)
SELECT
    gen_random_uuid(),
    vb.id,
    (SELECT id FROM items WHERE item_code = 'BIKE' LIMIT 1),
    data.model_name,
    data.model_code,
    (SELECT id FROM fuel_types WHERE code = 'PETROL' LIMIT 1),
    (SELECT id FROM transmission_types WHERE code = 'MANUAL' LIMIT 1),
    data.cc,
    TRUE,
    NOW()
FROM (
    VALUES
        -- Hero
        ('HERO', 'Splendor Plus', 'SPLENDOR_PLUS', 97),
        ('HERO', 'HF Deluxe', 'HF_DELUXE', 97),
        ('HERO', 'Passion Pro', 'PASSION_PRO', 113),
        ('HERO', 'Glamour', 'GLAMOUR_125', 124),
        ('HERO', 'Super Splendor', 'SUPER_SPLENDOR', 124),
        ('HERO', 'Xpulse 200 4V', 'XPULSE_200_4V', 199),
        ('HERO', 'Karizma XMR', 'KARIZMA_XMR', 210),
        -- Honda
        ('HONDA', 'CB Shine 125', 'CB_SHINE_125', 124),
        ('HONDA', 'Unicorn 160', 'UNICORN_160', 162),
        ('HONDA', 'SP 125', 'SP_125', 124),
        ('HONDA', 'Hornet 2.0', 'HORNET_20', 184),
        ('HONDA', 'CB350 Highness', 'CB350_HIGHNESS', 348),
        -- TVS
        ('TVS', 'Apache RTR 160 4V', 'APACHE_RTR_160_4V', 159),
        ('TVS', 'Apache RTR 200 4V', 'APACHE_RTR_200_4V', 197),
        ('TVS', 'Apache RR 310', 'APACHE_RR_310', 312),
        ('TVS', 'Raider 125', 'RAIDER_125', 124),
        ('TVS', 'Star City Plus', 'STAR_CITY_PLUS', 109),
        -- Bajaj
        ('BAJAJ', 'Pulsar 150', 'PULSAR_150', 149),
        ('BAJAJ', 'Pulsar NS200', 'PULSAR_NS200', 199),
        ('BAJAJ', 'Pulsar N250', 'PULSAR_N250', 249),
        ('BAJAJ', 'Platina 110', 'PLATINA_110', 115),
        ('BAJAJ', 'Avenger Cruise 220', 'AVENGER_CRUISE_220', 220),
        ('BAJAJ', 'Dominar 400', 'DOMINAR_400', 373),
        -- Royal Enfield
        ('ROYAL_ENFIELD', 'Classic 350', 'CLASSIC_350', 349),
        ('ROYAL_ENFIELD', 'Bullet 350', 'BULLET_350', 349),
        ('ROYAL_ENFIELD', 'Hunter 350', 'HUNTER_350', 349),
        ('ROYAL_ENFIELD', 'Meteor 350', 'METEOR_350', 349),
        ('ROYAL_ENFIELD', 'Himalayan 450', 'HIMALAYAN_450', 452),
        ('ROYAL_ENFIELD', 'Continental GT 650', 'CONTINENTAL_GT_650', 648),
        -- Yamaha
        ('YAMAHA', 'YZF R15 V4', 'YZF_R15_V4', 155),
        ('YAMAHA', 'MT 15 V2', 'MT_15_V2', 155),
        ('YAMAHA', 'FZ S V4', 'FZ_S_V4', 149),
        ('YAMAHA', 'FZ X', 'FZ_X', 149),
        -- Suzuki
        ('SUZUKI', 'Gixxer 150', 'GIXXER_150', 155),
        ('SUZUKI', 'Gixxer SF 250', 'GIXXER_SF_250', 249),
        ('SUZUKI', 'V-Strom SX', 'VSTROM_SX', 249),
        -- KTM
        ('KTM', 'Duke 200', 'DUKE_200', 199),
        ('KTM', 'Duke 390', 'DUKE_390', 398),
        ('KTM', 'RC 200', 'RC_200', 199),
        ('KTM', 'Adventure 390', 'ADVENTURE_390', 373),
        -- Kawasaki
        ('KAWASAKI', 'Ninja 300', 'NINJA_300', 296),
        ('KAWASAKI', 'Z900', 'Z900', 948)
) AS data(brand_code, model_name, model_code, cc)
JOIN vehicle_brands vb ON vb.brand_code = data.brand_code
ON CONFLICT DO NOTHING;

-- 3. Insert SCOOTY Models
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
        -- Honda
        ('HONDA', 'Activa 6G', 'ACTIVA_6G', 110),
        ('HONDA', 'Activa 125', 'ACTIVA_125', 124),
        ('HONDA', 'Dio 110', 'DIO_110', 110),
        ('HONDA', 'Dio 125', 'DIO_125', 124),
        -- TVS
        ('TVS', 'Jupiter 110', 'JUPITER_110', 110),
        ('TVS', 'Jupiter 125', 'JUPITER_125', 124),
        ('TVS', 'Ntorq 125', 'NTORQ_125', 124),
        ('TVS', 'iQube EV', 'IQUBE_EV', 0),
        -- Suzuki
        ('SUZUKI', 'Access 125', 'ACCESS_125', 124),
        ('SUZUKI', 'Burgman Street 125', 'BURGMAN_STREET_125', 124),
        ('SUZUKI', 'Avenis 125', 'AVENIS_125', 124),
        -- Hero
        ('HERO', 'Pleasure Plus', 'PLEASURE_PLUS', 110),
        ('HERO', 'Maestro Edge 125', 'MAESTRO_EDGE_125', 124),
        ('HERO', 'Xoom 110', 'XOOM_110', 110),
        ('HERO', 'Vida V1 Pro EV', 'VIDA_V1_PRO', 0),
        -- Yamaha
        ('YAMAHA', 'Fascino 125 FI', 'FASCINO_125', 125),
        ('YAMAHA', 'RayZR 125 FI', 'RAYZR_125', 125),
        ('YAMAHA', 'Aerox 155', 'AEROX_155', 155),
        -- Ather
        ('ATHER', 'Ather 450X', 'ATHER_450X', 0),
        ('ATHER', 'Ather Rizta', 'ATHER_RIZTA', 0),
        -- Ola Electric
        ('OLA', 'Ola S1 Pro', 'OLA_S1_PRO', 0),
        ('OLA', 'Ola S1 Air', 'OLA_S1_AIR', 0),
        ('OLA', 'Ola S1 X', 'OLA_S1_X', 0),
        -- Bajaj
        ('BAJAJ', 'Chetak EV', 'CHETAK_EV', 0)
) AS data(brand_code, model_name, model_code, cc)
JOIN vehicle_brands vb ON vb.brand_code = data.brand_code
ON CONFLICT DO NOTHING;

-- 4. Insert CAR Models
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
        -- Maruti Suzuki
        ('MARUTI_SUZUKI', 'Swift', 'SWIFT', 1197),
        ('MARUTI_SUZUKI', 'Dzire', 'DZIRE', 1197),
        ('MARUTI_SUZUKI', 'Baleno', 'BALENO', 1197),
        ('MARUTI_SUZUKI', 'Brezza', 'BREZZA', 1462),
        ('MARUTI_SUZUKI', 'Ertiga', 'ERTIGA', 1462),
        ('MARUTI_SUZUKI', 'Wagon R', 'WAGON_R', 1197),
        ('MARUTI_SUZUKI', 'Fronx', 'FRONX', 1197),
        ('MARUTI_SUZUKI', 'Grand Vitara', 'GRAND_VITARA', 1490),
        ('MARUTI_SUZUKI', 'Jimny', 'JIMNY', 1462),
        -- Hyundai
        ('HYUNDAI', 'Creta', 'CRETA', 1497),
        ('HYUNDAI', 'Venue', 'VENUE', 1197),
        ('HYUNDAI', 'i20', 'I20', 1197),
        ('HYUNDAI', 'Verna', 'VERNA', 1497),
        ('HYUNDAI', 'Grand i10 Nios', 'GRAND_I10_NIOS', 1197),
        ('HYUNDAI', 'Exter', 'EXTER', 1197),
        ('HYUNDAI', 'Alcazar', 'ALCAZAR', 1493),
        -- Tata
        ('TATA', 'Nexon', 'NEXON', 1199),
        ('TATA', 'Punch', 'PUNCH', 1199),
        ('TATA', 'Harrier', 'HARRIER', 1956),
        ('TATA', 'Safari', 'SAFARI', 1956),
        ('TATA', 'Tiago', 'TIAGO', 1199),
        ('TATA', 'Tigor', 'TIGOR', 1199),
        ('TATA', 'Curvv', 'CURVV', 1199),
        -- Mahindra
        ('MAHINDRA', 'Thar', 'THAR', 1997),
        ('MAHINDRA', 'XUV700', 'XUV700', 1997),
        ('MAHINDRA', 'Scorpio-N', 'SCORPIO_N', 2184),
        ('MAHINDRA', 'Scorpio Classic', 'SCORPIO_CLASSIC', 2184),
        ('MAHINDRA', 'XUV3XX', 'XUV3XX', 1197),
        ('MAHINDRA', 'Bolero Neo', 'BOLERO_NEO', 1493),
        -- Toyota
        ('TOYOTA', 'Innova Crysta', 'INNOVA_CRYSTA', 2393),
        ('TOYOTA', 'Innova Hycross', 'INNOVA_HYCROSS', 1987),
        ('TOYOTA', 'Fortuner', 'FORTUNER', 2755),
        ('TOYOTA', 'Urban Cruiser Taisor', 'TAISOR', 1197),
        ('TOYOTA', 'Glanza', 'GLANZA', 1197),
        -- Kia
        ('KIA', 'Seltos', 'SELTOS', 1497),
        ('KIA', 'Sonet', 'SONET', 1197),
        ('KIA', 'Carens', 'CARENS', 1497),
        -- Volkswagen
        ('VOLKSWAGEN', 'Virtus', 'VIRTUS', 999),
        ('VOLKSWAGEN', 'Taigun', 'TAIGUN', 999),
        -- Skoda
        ('SKODA', 'Slavia', 'SLAVIA', 999),
        ('SKODA', 'Kushaq', 'KUSHAQ', 999),
        -- MG
        ('MG', 'Hector', 'HECTOR', 1498),
        ('MG', 'Astor', 'ASTOR', 1498),
        ('MG', 'Comet EV', 'COMET_EV', 0)
) AS data(brand_code, model_name, model_code, cc)
JOIN vehicle_brands vb ON vb.brand_code = data.brand_code
ON CONFLICT DO NOTHING;
