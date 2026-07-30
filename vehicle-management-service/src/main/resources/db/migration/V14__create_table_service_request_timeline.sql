CREATE TABLE service_request_timeline (

                                          id BIGSERIAL PRIMARY KEY,

                                          service_request_id BIGINT NOT NULL,

                                          status VARCHAR(50) NOT NULL,

                                          remarks VARCHAR(500),

                                          created_by BIGINT,

                                          created_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                          CONSTRAINT fk_timeline_request
                                              FOREIGN KEY(service_request_id)
                                                  REFERENCES service_requests(id)
                                                  ON DELETE CASCADE
);