INSERT INTO vehicle_models
(
    id,
    brand_id,
    model_name,
    model_code,
    fuel_type_id,
    transmission_type_id,
    engine_capacity_cc,
    logo_url,
    is_active,
    created_at,
    last_modified_at
)
SELECT
    gen_random_uuid(),
    vb.id,
    data.model_name,
    data.model_code,
    ft.id,
    tt.id,
    data.engine_capacity_cc,
    NULL,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM
    (
        VALUES

            ('HERO','Splendor Plus','SPLENDOR_PLUS',97),
            ('HERO','HF Deluxe','HF_DELUXE',97),
            ('HERO','Passion Plus','PASSION_PLUS',97),
            ('HERO','Glamour','GLAMOUR',125),
            ('HERO','Xtreme 160R','XTREME_160R',163),

            ('HONDA','Shine','SHINE',125),
            ('HONDA','SP125','SP125',125),
            ('HONDA','Unicorn','UNICORN',162),
            ('HONDA','Hornet 2.0','HORNET_2_0',184),
            ('HONDA','CB350','CB350',348),

            ('BAJAJ','Platina 100','PLATINA_100',102),
            ('BAJAJ','CT110X','CT110X',115),
            ('BAJAJ','Pulsar 125','PULSAR_125',125),
            ('BAJAJ','Pulsar N160','PULSAR_N160',164),
            ('BAJAJ','Dominar 400','DOMINAR_400',373),

            ('TVS','Sport','SPORT',109),
            ('TVS','Radeon','RADEON',110),
            ('TVS','Apache RTR 160','APACHE_RTR_160',159),
            ('TVS','Apache RTR 200 4V','APACHE_RTR_200_4V',197),
            ('TVS','Ronin','RONIN',225),

            ('YAMAHA','FZ-S FI','FZS_FI',149),
            ('YAMAHA','FZ-X','FZX',149),
            ('YAMAHA','R15 V4','R15_V4',155),
            ('YAMAHA','MT-15','MT15',155),
            ('YAMAHA','Fazer FI','FAZER_FI',149),

            ('ROYAL_ENFIELD','Bullet 350','BULLET_350',349),
            ('ROYAL_ENFIELD','Classic 350','CLASSIC_350',349),
            ('ROYAL_ENFIELD','Hunter 350','HUNTER_350',349),
            ('ROYAL_ENFIELD','Meteor 350','METEOR_350',349),
            ('ROYAL_ENFIELD','Himalayan 450','HIMALAYAN_450',452),

            ('KTM','125 Duke','125_DUKE',125),
            ('KTM','200 Duke','200_DUKE',199),
            ('KTM','250 Duke','250_DUKE',249),
            ('KTM','390 Duke','390_DUKE',399),
            ('KTM','RC 390','RC_390',399),

            ('SUZUKI','Hayate EP','HAYATE_EP',113),
            ('SUZUKI','Gixxer','GIXXER',155),
            ('SUZUKI','Gixxer SF','GIXXER_SF',155),
            ('SUZUKI','V-Strom SX','VSTROM_SX',249),
            ('SUZUKI','GSX-8R','GSX_8R',776)

    ) AS data
        (
         brand_code,
         model_name,
         model_code,
         engine_capacity_cc
            )

        INNER JOIN vehicle_brands vb
                   ON vb.brand_code = data.brand_code

        INNER JOIN fuel_types ft
                   ON ft.code = 'PETROL'

        INNER JOIN transmission_types tt
                   ON tt.code = 'MANUAL'
ON CONFLICT ON CONSTRAINT uk_brand_model DO NOTHING
