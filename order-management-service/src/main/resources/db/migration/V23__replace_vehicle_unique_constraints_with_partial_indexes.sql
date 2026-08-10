-- Drop the existing global unique constraints
ALTER TABLE customer_vehicles DROP CONSTRAINT IF EXISTS uk_registration_number;
ALTER TABLE customer_vehicles DROP CONSTRAINT IF EXISTS uk_engine_number;
ALTER TABLE customer_vehicles DROP CONSTRAINT IF EXISTS uk_chassis_number;

-- Create partial unique indexes that only apply to active vehicles
CREATE UNIQUE INDEX uk_registration_number_active 
    ON customer_vehicles(registration_number) 
    WHERE is_active = true;

CREATE UNIQUE INDEX uk_engine_number_active 
    ON customer_vehicles(engine_number) 
    WHERE engine_number IS NOT NULL AND is_active = true;

CREATE UNIQUE INDEX uk_chassis_number_active 
    ON customer_vehicles(chassis_number) 
    WHERE chassis_number IS NOT NULL AND is_active = true;
