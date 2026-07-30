CREATE TABLE service_requests (

                                  id BIGSERIAL PRIMARY KEY,

                                  request_number VARCHAR(30) NOT NULL UNIQUE,

                                  customer_id BIGINT NOT NULL,

                                  customer_vehicle_id BIGINT NOT NULL,

                                  address_id BIGINT NOT NULL,

                                  request_type_id BIGINT NOT NULL,

                                  preferred_service_date DATE NOT NULL,

                                  service_slot_id BIGINT NOT NULL,

                                  description TEXT,

                                  status VARCHAR(50) NOT NULL,

                                  is_active BOOLEAN NOT NULL DEFAULT TRUE,

                                  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                  last_modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                  CONSTRAINT fk_sr_request_type
                                      FOREIGN KEY(request_type_id)
                                          REFERENCES request_types(id)

);