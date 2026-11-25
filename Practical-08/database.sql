-- TechMart Electronics - Database script
CREATE DATABASE IF NOT EXISTS techmart;
USE techmart;

CREATE TABLE IF NOT EXISTS products (
    product_id   VARCHAR(20)   PRIMARY KEY,
    product_name VARCHAR(100)  NOT NULL,
    category     VARCHAR(50)   NOT NULL,
    price        DECIMAL(10,2) NOT NULL,
    quantity     INT           NOT NULL,
    description  TEXT
);

-- Optional sample data
INSERT IGNORE INTO products (product_id, product_name, category, price, quantity, description) VALUES
('P001', 'Wireless Mouse', 'Accessories', 599.00, 25, '2.4 GHz wireless optical mouse'),
('P002', 'Mechanical Keyboard', 'Accessories', 2499.00, 10, 'RGB backlit keyboard'),
('P003', 'Smartphone X', 'Mobiles', 15999.00, 5, '6 GB RAM, 128 GB storage');
