CREATE TABLE items (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id      BIGINT,
    item_code        VARCHAR(50) NOT NULL UNIQUE,
    display_name     VARCHAR(100) NOT NULL,
    description      VARCHAR(255),
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_items_category
        FOREIGN KEY (category_id)
            REFERENCES service_categories (id)
);

CREATE INDEX idx_items_code ON items(item_code);

INSERT INTO items (item_code, display_name, description)
VALUES
    ('BIKE', 'Motorcycle / Bike', 'Two-wheeler motorcycle'),
    ('SCOOTY', 'Scooter / Scooty', 'Two-wheeler scooter'),
    ('CAR', 'Four Wheeler / Car', 'Four-wheeler automobile'),
    ('TV', 'Television', 'Home television appliance'),
    ('WASHING_MACHINE', 'Washing Machine', 'Home washing machine appliance');

ALTER TABLE customer_vehicles
    ADD COLUMN item_id UUID REFERENCES items(id);

CREATE INDEX idx_customer_vehicle_item ON customer_vehicles(item_id);

CREATE TABLE service_pricing_rules (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id          UUID NOT NULL,
    request_type_id  BIGINT NOT NULL,
    base_charge      DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    convenience_fee  DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    platform_fee     DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    gst_percentage   DECIMAL(5, 2) NOT NULL DEFAULT 18.00,
    is_gst_inclusive BOOLEAN NOT NULL DEFAULT FALSE,
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_pricing_item
        FOREIGN KEY (item_id)
            REFERENCES items (id),

    CONSTRAINT fk_pricing_request_type
        FOREIGN KEY (request_type_id)
            REFERENCES request_types (id),

    CONSTRAINT uk_item_request_type
        UNIQUE (item_id, request_type_id)
);

CREATE INDEX idx_pricing_item_request ON service_pricing_rules(item_id, request_type_id);

INSERT INTO service_pricing_rules (item_id, request_type_id, base_charge, convenience_fee, platform_fee, gst_percentage)
VALUES
    ((SELECT id FROM items WHERE item_code = 'BIKE' LIMIT 1), 3, 300.00, 50.00, 15.00, 18.00),
    ((SELECT id FROM items WHERE item_code = 'SCOOTY' LIMIT 1), 3, 250.00, 50.00, 15.00, 18.00),
    ((SELECT id FROM items WHERE item_code = 'CAR' LIMIT 1), 3, 500.00, 100.00, 25.00, 18.00),
    ((SELECT id FROM items WHERE item_code = 'TV' LIMIT 1), 3, 350.00, 50.00, 15.00, 18.00),
    ((SELECT id FROM items WHERE item_code = 'WASHING_MACHINE' LIMIT 1), 3, 400.00, 50.00, 15.00, 18.00),
    ((SELECT id FROM items WHERE item_code = 'BIKE' LIMIT 1), 1, 499.00, 50.00, 20.00, 18.00),
    ((SELECT id FROM items WHERE item_code = 'BIKE' LIMIT 1), 2, 200.00, 50.00, 15.00, 18.00),
    ((SELECT id FROM items WHERE item_code = 'BIKE' LIMIT 1), 4, 350.00, 100.00, 25.00, 18.00);

CREATE TABLE coupons (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_code         VARCHAR(50) NOT NULL UNIQUE,
    title               VARCHAR(100) NOT NULL,
    description         VARCHAR(255),
    discount_type       VARCHAR(20) NOT NULL,
    discount_value      DECIMAL(10, 2) NOT NULL,
    max_discount_amount DECIMAL(10, 2),
    min_order_amount    DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO coupons (coupon_code, title, description, discount_type, discount_value, max_discount_amount, min_order_amount)
VALUES
    ('WELCOME50', 'Flat ₹50 Off', 'Get flat ₹50 off on your booking', 'FLAT', 50.00, 50.00, 200.00),
    ('INSPECT30', '30% Off on Inspection', 'Get 30% off on vehicle inspection fee', 'PERCENTAGE', 30.00, 100.00, 200.00);
