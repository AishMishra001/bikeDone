CREATE TABLE IF NOT EXISTS mechanic_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mechanic_id UUID NOT NULL UNIQUE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    is_online BOOLEAN NOT NULL DEFAULT TRUE,
    is_busy BOOLEAN NOT NULL DEFAULT FALSE,
    last_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mechanic_loc_lat_lng ON mechanic_locations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_mechanic_loc_online_busy ON mechanic_locations(is_online, is_busy);
