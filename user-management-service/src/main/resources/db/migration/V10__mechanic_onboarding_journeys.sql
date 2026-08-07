CREATE TABLE mechanic_onboarding_journeys (

    id UUID PRIMARY KEY,

    mechanic_id UUID NOT NULL,

    onboarding_step_id UUID NOT NULL,

    status VARCHAR(30) NOT NULL,

    remarks VARCHAR(500),

    acted_by UUID,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    last_modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_journey_mechanic
      FOREIGN KEY(mechanic_id)
          REFERENCES users(id),

    CONSTRAINT fk_journey_step
      FOREIGN KEY(onboarding_step_id)
          REFERENCES master_onboarding_steps(id)
);