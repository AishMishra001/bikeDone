CREATE TABLE categories (
    id                  BIGSERIAL PRIMARY KEY,
    category_code       VARCHAR(50) NOT NULL UNIQUE,
    display_name        VARCHAR(100) NOT NULL,
    description         VARCHAR(255),
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categories (id, category_code, display_name, description)
VALUES
    (1, 'TWO_WHEELER', 'Two Wheeler', 'Bikes, Scooters, and Motorized Two Wheelers'),
    (2, 'FOUR_WHEELER', 'Four Wheeler', 'Cars, SUVs, and Four Wheelers'),
    (3, 'HOME_APPLIANCES', 'Home Appliances', 'TVs, Washing Machines, ACs, and Electronics');

SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));

ALTER TABLE items DROP CONSTRAINT IF EXISTS fk_items_category;

ALTER TABLE items
    ADD CONSTRAINT fk_items_category
        FOREIGN KEY (category_id)
            REFERENCES categories (id);

UPDATE items SET category_id = 1 WHERE item_code IN ('BIKE', 'SCOOTY');
UPDATE items SET category_id = 2 WHERE item_code IN ('CAR');
UPDATE items SET category_id = 3 WHERE item_code IN ('TV', 'WASHING_MACHINE');
