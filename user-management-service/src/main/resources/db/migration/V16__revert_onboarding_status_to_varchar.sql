-- Revert database column status in mechanic_onboarding_journeys to VARCHAR(30)
ALTER TABLE mechanic_onboarding_journeys 
  ALTER COLUMN status TYPE VARCHAR(30) 
  USING status::text;

-- Drop enum type if it exists
DROP TYPE IF EXISTS onboarding_step_status_enum;
