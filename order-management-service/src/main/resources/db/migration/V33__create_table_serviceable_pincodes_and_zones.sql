CREATE TABLE IF NOT EXISTS serviceable_pincodes (
    id BIGSERIAL PRIMARY KEY,
    pincode VARCHAR(10) NOT NULL UNIQUE,
    area_name VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Noida',
    state VARCHAR(100) NOT NULL DEFAULT 'Uttar Pradesh',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    radius_km DECIMAL(5, 2) DEFAULT 5.0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_serviceable_pincodes_pincode ON serviceable_pincodes(pincode);
CREATE INDEX IF NOT EXISTS idx_serviceable_pincodes_active ON serviceable_pincodes(is_active);

-- Seed Initial Configurable Noida & Greater Noida Pincodes
INSERT INTO serviceable_pincodes (pincode, area_name, city, state, latitude, longitude, radius_km, is_active) VALUES
('201301', 'Sector 1 to 20, Atta Market & Film City', 'Noida', 'Uttar Pradesh', 28.5708, 77.3260, 6.0, TRUE),
('201302', 'Sector 21 to 30', 'Noida', 'Uttar Pradesh', 28.5830, 77.3340, 5.0, TRUE),
('201303', 'Sector 31 to 45 & Golf Course', 'Noida', 'Uttar Pradesh', 28.5680, 77.3500, 5.0, TRUE),
('201304', 'Sector 46 to 61', 'Noida', 'Uttar Pradesh', 28.5900, 77.3620, 6.0, TRUE),
('201305', 'Sector 80, 81, Phase 2 & Hosiery Complex', 'Noida', 'Uttar Pradesh', 28.5300, 77.4000, 6.0, TRUE),
('201306', 'Knowledge Park & Greater Noida Industrial', 'Greater Noida', 'Uttar Pradesh', 28.4600, 77.4900, 7.0, TRUE),
('201307', 'Sector 62, 63, 64 & Electronic City', 'Noida', 'Uttar Pradesh', 28.6280, 77.3670, 6.0, TRUE),
('201308', 'Greater Noida West, Gaur City & Noida Extension', 'Greater Noida', 'Uttar Pradesh', 28.6080, 77.4280, 8.0, TRUE),
('201309', 'Sector 125 to 137 Expressway Corridor', 'Noida', 'Uttar Pradesh', 28.5135, 77.4042, 7.0, TRUE),
('201310', 'Pari Chowk, Alpha, Beta, Gamma & Delta', 'Greater Noida', 'Uttar Pradesh', 28.4720, 77.5030, 8.0, TRUE),
('201318', 'Sector 142 to 168 Expressway Hubs', 'Noida', 'Uttar Pradesh', 28.4900, 77.4200, 6.0, TRUE)
ON CONFLICT (pincode) DO NOTHING;
