-- V21: Update and configure master_onboarding_steps

-- Insert SERVICE_RADIUS if not exists
INSERT INTO master_onboarding_steps (id, step_code, display_name, step_order, is_mandatory, is_active, created_at, updated_at)
VALUES (gen_random_uuid(), 'SERVICE_RADIUS', 'Service Radius', 4, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (step_code) DO UPDATE 
SET step_order = 4, is_mandatory = TRUE, is_active = TRUE, updated_at = CURRENT_TIMESTAMP;

-- Insert TRAINING_SOP if not exists
INSERT INTO master_onboarding_steps (id, step_code, display_name, step_order, is_mandatory, is_active, created_at, updated_at)
VALUES (gen_random_uuid(), 'TRAINING_SOP', 'Quality & SOP Training', 7, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (step_code) DO UPDATE 
SET step_order = 7, is_mandatory = TRUE, is_active = TRUE, updated_at = CURRENT_TIMESTAMP;

-- Update existing step orders
UPDATE master_onboarding_steps SET step_order = 1, is_mandatory = TRUE, is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE step_code = 'BASIC_DETAILS';
UPDATE master_onboarding_steps SET step_order = 2, is_mandatory = TRUE, is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE step_code = 'SHOP_DETAILS';
UPDATE master_onboarding_steps SET step_order = 3, is_mandatory = TRUE, is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE step_code = 'SERVICE_CATEGORIES';
UPDATE master_onboarding_steps SET step_order = 4, is_mandatory = TRUE, is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE step_code = 'SERVICE_RADIUS';
UPDATE master_onboarding_steps SET step_order = 5, is_mandatory = TRUE, is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE step_code = 'DOCUMENTS';
UPDATE master_onboarding_steps SET step_order = 6, is_mandatory = TRUE, is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE step_code = 'BANK_DETAILS';
UPDATE master_onboarding_steps SET step_order = 7, is_mandatory = TRUE, is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE step_code = 'TRAINING_SOP';
UPDATE master_onboarding_steps SET step_order = 8, is_mandatory = FALSE, is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE step_code = 'MANUAL_VERIFICATION';

-- Inactive legacy steps
UPDATE master_onboarding_steps SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE step_code = 'REQUEST_TYPES';
