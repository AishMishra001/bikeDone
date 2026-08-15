ALTER TABLE order_bill_breakdowns
    ADD COLUMN extra_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
