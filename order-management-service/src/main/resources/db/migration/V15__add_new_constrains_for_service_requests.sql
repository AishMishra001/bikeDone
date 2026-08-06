ALTER TABLE service_requests
    ADD CONSTRAINT chk_service_request_status
        CHECK (
            status IN (
                       'REQUEST_CREATED',
                       'MECHANIC_ASSIGNED',
                       'ON_THE_WAY',
                       'ARRIVED',
                       'INSPECTION_STARTED',
                       'ESTIMATE_PREPARED',
                       'CUSTOMER_APPROVED',
                       'WORK_STARTED',
                       'WORK_COMPLETED',
                       'CANCELLED'
                )
            );