CREATE TABLE master_onboarding_steps (
     id UUID PRIMARY KEY,

     step_code VARCHAR(100) NOT NULL UNIQUE,

     display_name VARCHAR(150) NOT NULL,

     step_order INTEGER NOT NULL,

     is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,

     is_active BOOLEAN NOT NULL DEFAULT TRUE,

     created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

     last_modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO master_onboarding_steps
(
    id,
    step_code,
    display_name,
    step_order,
    is_mandatory,
    is_active
)
VALUES
    (gen_random_uuid(),'BASIC_DETAILS','Basic Details',1,TRUE,TRUE),
    (gen_random_uuid(),'SHOP_DETAILS','Shop Details',2,TRUE,TRUE),
    (gen_random_uuid(),'REQUEST_TYPES','Request Types',3,TRUE,TRUE),
    (gen_random_uuid(),'SERVICE_CATEGORIES','Service Categories',4,TRUE,TRUE),
    (gen_random_uuid(),'DOCUMENTS','Documents',5,TRUE,TRUE),
    (gen_random_uuid(),'BANK_DETAILS','Bank Details',6,TRUE,TRUE),
    (gen_random_uuid(),'MANUAL_VERIFICATION','Manual Verification',7,FALSE,TRUE);