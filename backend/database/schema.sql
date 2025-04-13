-- 用户表
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    wallet_address VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 商品表
CREATE TABLE products (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(20,18) NOT NULL,
    image_url VARCHAR(255),
    main_category VARCHAR(50) NOT NULL,
    sub_category VARCHAR(50) NOT NULL,
    sales INT DEFAULT 0,
    seller_id VARCHAR(255) NOT NULL,
    specifications JSON,
    numeric_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id)
);

-- 购物车表
CREATE TABLE cart_items (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    product_id VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(20,18) NOT NULL,
    image_url VARCHAR(255),
    numeric_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 卖家表
CREATE TABLE sellers (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(255),
    image_url VARCHAR(255),
    sales_volume INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 5.00,
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    total_sales DECIMAL(20,18) DEFAULT 0,
    monthly_sales DECIMAL(20,18) DEFAULT 0,
    products_count INT DEFAULT 0,
    wallet_address VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (wallet_address) REFERENCES users(wallet_address)
);

-- 订单表
CREATE TABLE orders (
    id VARCHAR(255) PRIMARY KEY,
    buyer_id VARCHAR(255) NOT NULL,
    total_amount DECIMAL(20,18) NOT NULL,
    status ENUM('pending', 'paid', 'shipped', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    transaction_hash VARCHAR(255),
    is_frozen BOOLEAN DEFAULT FALSE,
    processed_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(id)
);

-- 订单商品表
CREATE TABLE order_items (
    id VARCHAR(255) PRIMARY KEY,
    order_id VARCHAR(255) NOT NULL,
    product_id VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(20,18) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 卖家申请表
CREATE TABLE seller_applications (
    id VARCHAR(255) PRIMARY KEY,
    wallet_address VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    reason TEXT,
    processed_by VARCHAR(255),
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (wallet_address) REFERENCES users(wallet_address)
);

CREATE INDEX idx_seller_applications_wallet ON seller_applications(wallet_address);
CREATE INDEX idx_seller_applications_status ON seller_applications(status);

-- 创建索引
CREATE INDEX idx_products_categories ON products(main_category, sub_category);
CREATE INDEX idx_products_sales ON products(sales DESC);
CREATE INDEX idx_cart_user ON cart_items(user_id);
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_status ON orders(status);
