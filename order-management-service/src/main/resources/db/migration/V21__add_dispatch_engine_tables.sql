-- Add dispatch tracking columns to service_requests table
ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS assigned_mechanic_id UUID,
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS current_dispatch_round INT NOT NULL DEFAULT 0;

-- Update status check constraint on service_requests to include SEARCHING_MECHANIC and NO_MECHANIC_AVAILABLE
ALTER TABLE service_requests DROP CONSTRAINT IF EXISTS chk_service_request_status;

ALTER TABLE service_requests
    ADD CONSTRAINT chk_service_request_status
        CHECK (
            status IN (
                       'REQUEST_CREATED',
                       'SEARCHING_MECHANIC',
                       'MECHANIC_ASSIGNED',
                       'NO_MECHANIC_AVAILABLE',
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

-- Create dispatch_runs table
CREATE TABLE IF NOT EXISTS dispatch_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    current_round INT NOT NULL DEFAULT 1,
    max_rounds INT NOT NULL DEFAULT 10,
    round_wait_seconds INT NOT NULL DEFAULT 30,
    status VARCHAR(30) NOT NULL DEFAULT 'IN_PROGRESS',
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_at TIMESTAMP
);

-- Create dispatch_mechanic_notifications table
CREATE TABLE IF NOT EXISTS dispatch_mechanic_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispatch_run_id UUID NOT NULL REFERENCES dispatch_runs(id) ON DELETE CASCADE,
    service_request_id UUID NOT NULL,
    mechanic_id UUID NOT NULL,
    round_number INT NOT NULL,
    notification_status VARCHAR(30) NOT NULL DEFAULT 'NOTIFIED',
    notified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dispatch_runs_sr_id ON dispatch_runs(service_request_id);
CREATE INDEX IF NOT EXISTS idx_dispatch_notif_run_round ON dispatch_mechanic_notifications(dispatch_run_id, round_number);
