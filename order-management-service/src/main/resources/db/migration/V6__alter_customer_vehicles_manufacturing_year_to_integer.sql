DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'customer_vehicles' AND column_name = 'manufacturing_year'
    ) THEN
        ALTER TABLE customer_vehicles ALTER COLUMN manufacturing_year TYPE INTEGER USING manufacturing_year::INTEGER;
    ELSE
        ALTER TABLE customer_vehicles ADD COLUMN manufacturing_year INTEGER;
    END IF;
END $$;

ALTER TABLE customer_vehicles
ADD COLUMN IF NOT EXISTS vehicle_data JSONB;