ALTER TABLE master_onboarding_steps 
    RENAME COLUMN last_modified_at TO updated_at;

ALTER TABLE mechanic_onboarding_journeys 
    RENAME COLUMN last_modified_at TO updated_at;
