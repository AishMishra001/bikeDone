ALTER TABLE coupon_applicability_rules DROP CONSTRAINT IF EXISTS fk_coupon_applicability_category;

ALTER TABLE coupon_applicability_rules
    ADD CONSTRAINT fk_coupon_applicability_category
        FOREIGN KEY (category_id)
            REFERENCES categories (id);

INSERT INTO coupon_applicability_rules (coupon_id, request_type_id, category_id, item_id)
VALUES 
    -- For BIKE (Two Wheeler, item BIKE)
    ((SELECT id FROM coupons WHERE coupon_code = 'INSPECT30' LIMIT 1),
     (SELECT id FROM request_types WHERE request_type_code = 'INSPECTION' LIMIT 1),
     (SELECT id FROM categories WHERE category_code = 'TWO_WHEELER' LIMIT 1),
     (SELECT id FROM items WHERE item_code = 'BIKE' LIMIT 1)),
     
    -- For SCOOTY (Two Wheeler, item SCOOTY)
    ((SELECT id FROM coupons WHERE coupon_code = 'INSPECT30' LIMIT 1),
     (SELECT id FROM request_types WHERE request_type_code = 'INSPECTION' LIMIT 1),
     (SELECT id FROM categories WHERE category_code = 'TWO_WHEELER' LIMIT 1),
     (SELECT id FROM items WHERE item_code = 'SCOOTY' LIMIT 1)),
     
    -- For CAR (Four Wheeler, item CAR)
    ((SELECT id FROM coupons WHERE coupon_code = 'INSPECT30' LIMIT 1),
     (SELECT id FROM request_types WHERE request_type_code = 'INSPECTION' LIMIT 1),
     (SELECT id FROM categories WHERE category_code = 'FOUR_WHEELER' LIMIT 1),
     (SELECT id FROM items WHERE item_code = 'CAR' LIMIT 1));
