CREATE TABLE orders_products (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    prenda_id INT NOT NULL,
    tela_id INT NOT NULL,
    quantity INT NOT NULL,
    size VARCHAR(15) NOT NULL,
    sex VARCHAR(10) NOT NULL,
    details TEXT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (prenda_id) REFERENCES prendas(id),
    FOREIGN KEY (tela_id) REFERENCES telas(id)
);

ALTER TABLE orders ADD COLUMN cortador_id INT DEFAULT 1 NOT NULL;
ALTER TABLE orders ADD CONSTRAINT orders_cortador_id FOREIGN KEY (cortador_id) references clientes(id);

ALTER TABLE orders DROP COLUMN prenda_id;
ALTER TABLE orders DROP COLUMN tela_id;
ALTER TABLE orders DROP COLUMN quantity;
ALTER TABLE orders DROP COLUMN size;
ALTER TABLE orders DROP COLUMN sex;
ALTER TABLE orders DROP COLUMN details;

select *
from orders;

select *
from orders_products;

INSERT INTO stocks (id,stock, description) VALUES (7,45, 'Vendaval');
INSERT INTO telas (code,color, stock_id ) VALUES
('11-0601', (252, 252, 252), 7),
('13-0630', (209, 228, 14), 7),
('15-1460', (243, 97, 42), 7),
('17-4402', (126, 133, 131), 7),
('17-4432', (208, 36, 64), 7),
('18-1660', (56, 138, 179), 7),
('18-4051', (53, 72, 66), 7),
('18-4148', (49, 96, 172), 7),
('18-5913', (42, 93, 170), 7),
('19-1934', (108, 31, 53), 7),
('19-4006', (33, 34, 37), 7),
('19-4023', (44, 51, 65), 7),
('19-4028', (41, 57, 81), 7);

INSERT INTO stocks (id,stock, description) VALUES (8,46, 'Megadrill');
INSERT INTO telas (code,color, stock_id ) VALUES
('11-0601', (252, 252, 252), 8),
('14-4522', (29, 34, 53), 8),
('16-4032', (87, 196, 217), 8),
('19-3864', (99, 136, 202), 8),
('19-4007', (41, 65, 126), 8),
('19-4024', (31, 32, 37), 8),
('19-4056', (59, 71, 82), 8),
('19-4220', (40, 81, 151), 8);

INSERT INTO stocks (id,stock, description) VALUES (9,47, 'Tempestad');
INSERT INTO telas (code,color, stock_id ) VALUES
    ('11-0601', (255, 255, 255), 9),
    ('15-4305', (129, 135, 139), 9),
    ('17-6030', (0, 130, 110)  , 9) ,
    ('18-4051', (0, 83, 159)   , 9),
    ('19-0414', (54, 61, 50)   , 9),
    ('19-1664', (179, 35, 40)  , 9),
    ('19-4005', (0, 0, 0)      , 9),
    ('19-4023' , (31, 39, 54)  , 9),
    ('19-4024', (24, 34, 56)   , 9);

-- Crear tabla de parámetros
CREATE TABLE parameters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar parámetro para la paleta de colores
INSERT INTO parameters (name, description, value) VALUES
('stock_colors_model_selector', 'ID del stock de colores a usar en el selector de modelos', '32909');

-- Crear tabla para almacenar información de imágenes cargadas
CREATE TABLE product_images (
    id VARCHAR(36) PRIMARY KEY,
    extension VARCHAR(10) NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    order_product_id INT,
    FOREIGN KEY (order_product_id) REFERENCES orders_products(id) ON DELETE SET NULL
);

CREATE INDEX idx_product_images_order_product ON product_images(order_product_id);
CREATE INDEX idx_product_images_upload_date ON product_images(upload_date);

ALTER TABLE clientes DROP COLUMN description;
