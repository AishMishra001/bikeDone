CREATE TABLE service_issues (
    id                  BIGSERIAL PRIMARY KEY,
    service_category_id BIGINT NOT NULL,
    issue_code          VARCHAR(100) NOT NULL UNIQUE,
    display_name        VARCHAR(150) NOT NULL,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_service_issue_category
        FOREIGN KEY (service_category_id)
            REFERENCES service_categories(id)
);

INSERT INTO service_issues(service_category_id, issue_code, display_name)
VALUES
    (1,'BIKE_NOT_STARTING','Bike Not Starting'),
    (1,'ENGINE_NOISE','Engine Noise'),
    (1,'LOW_PICKUP','Low Pickup'),
    (2,'BRAKE_FAILURE','Brake Failure'),
    (4,'BATTERY_DEAD','Battery Dead');