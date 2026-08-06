ALTER TABLE customer_vehicles
    ALTER COLUMN manufacturing_year TYPE INTEGER USING manufacturing_year::INTEGER;
