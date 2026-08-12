ALTER TABLE coupons
    ADD COLUMN usage_limit_per_user INT DEFAULT 1,
    ADD COLUMN total_usage_limit INT DEFAULT 1000;

CREATE TABLE coupon_applicability_rules (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id        UUID NOT NULL,
    request_type_id  BIGINT,
    category_id      BIGINT,
    item_id          UUID,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_coupon_applicability_coupon
        FOREIGN KEY (coupon_id)
            REFERENCES coupons (id),

    CONSTRAINT fk_coupon_applicability_request_type
        FOREIGN KEY (request_type_id)
            REFERENCES request_types (id),

    CONSTRAINT fk_coupon_applicability_category
        FOREIGN KEY (category_id)
            REFERENCES service_categories (id),

    CONSTRAINT fk_coupon_applicability_item
        FOREIGN KEY (item_id)
            REFERENCES items (id)
);

CREATE INDEX idx_coupon_applicability_coupon ON coupon_applicability_rules(coupon_id);

CREATE TABLE user_coupon_redemptions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL,
    coupon_id               UUID NOT NULL,
    service_request_id      UUID,
    discount_applied_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    used_at                 TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_redemption_coupon
        FOREIGN KEY (coupon_id)
            REFERENCES coupons (id),

    CONSTRAINT fk_user_redemption_service_request
        FOREIGN KEY (service_request_id)
            REFERENCES service_requests (id)
);

CREATE INDEX idx_user_redemptions_user_coupon ON user_coupon_redemptions(user_id, coupon_id);
CREATE INDEX idx_user_redemptions_coupon ON user_coupon_redemptions(coupon_id);

CREATE TABLE order_bill_breakdowns (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_request_id   UUID NOT NULL UNIQUE,
    base_charge          DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    convenience_fee      DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    platform_fee         DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    discount_amount      DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    coupon_code_applied  VARCHAR(50),
    taxable_amount       DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    gst_amount           DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    cgst_amount          DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    sgst_amount          DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    final_payable_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    price_breakdown_json JSONB,
    created_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_bill_breakdown_service_request
        FOREIGN KEY (service_request_id)
            REFERENCES service_requests (id)
);

CREATE INDEX idx_bill_breakdown_request ON order_bill_breakdowns(service_request_id);
