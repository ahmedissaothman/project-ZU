 
-- Pharmacy Management System Database Schema

-- 1. Roles and Users
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    dob DATE,
    address TEXT,
    password_hash TEXT NOT NULL,
    role_id INT REFERENCES roles(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Companies and Medicine Categories
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_info TEXT
);

CREATE TABLE medicine_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- 3. Medicines and Batches
CREATE TABLE medicines (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    dosage_form VARCHAR(50),
    strength VARCHAR(50),
    category_id INT REFERENCES medicine_categories(id),
    company_id INT REFERENCES companies(id),
    requires_prescription BOOLEAN DEFAULT FALSE
);

CREATE TABLE batches (
    id SERIAL PRIMARY KEY,
    medicine_id INT REFERENCES medicines(id),
    batch_number VARCHAR(100),
    quantity INT NOT NULL,
    expiry_date DATE,
    purchase_price NUMERIC(10,2),
    selling_price NUMERIC(10,2),
    received_date DATE DEFAULT CURRENT_DATE
);

-- 4. Stock Movement and Damage Reports
CREATE TABLE stock_movements (
    id SERIAL PRIMARY KEY,
    batch_id INT REFERENCES batches(id),
    quantity INT,
    movement_type VARCHAR(20) CHECK (movement_type IN ('IN', 'OUT', 'DAMAGE')),
    reason TEXT,
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE damage_reports (
    id SERIAL PRIMARY KEY,
    batch_id INT REFERENCES batches(id),
    quantity INT,
    reason TEXT,
    reported_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Doctors and Prescriptions
CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100),
    license_number VARCHAR(50),
    contact_info TEXT
);

CREATE TABLE prescriptions (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES users(id),
    doctor_id INT REFERENCES doctors(id),
    diagnosis TEXT,
    prescribed_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prescription_items (
    id SERIAL PRIMARY KEY,
    prescription_id INT REFERENCES prescriptions(id),
    medicine_id INT REFERENCES medicines(id),
    dosage_instruction TEXT,
    duration_days INT
);

-- 6. Orders and Order Items
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES users(id),
    ordered_by INT REFERENCES users(id),
    order_status VARCHAR(20) CHECK (order_status IN ('PENDING', 'DELIVERED', 'CANCELLED')),
    payment_status VARCHAR(20) CHECK (payment_status IN ('PAID', 'UNPAID', 'PARTIAL')),
    total_amount NUMERIC(10,2),
    discount NUMERIC(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id),
    batch_id INT REFERENCES batches(id),
    quantity INT,
    unit_price NUMERIC(10,2),
    vat_percent NUMERIC(5,2)
);

-- 7. Payments and Receipts
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id),
    paid_by INT REFERENCES users(id),
    amount NUMERIC(10,2),
    payment_method VARCHAR(30), -- Cash, Mobile Money, Insurance
    transaction_reference VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE receipts (
    id SERIAL PRIMARY KEY,
    payment_id INT REFERENCES payments(id),
    receipt_url TEXT,
    printed_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Deliveries and Feedback
CREATE TABLE deliveries (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id),
    delivery_person_id INT REFERENCES users(id),
    delivery_address TEXT,
    delivered_at TIMESTAMP,
    status VARCHAR(20) CHECK (status IN ('PENDING', 'IN_TRANSIT', 'DELIVERED'))
);

CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id),
    user_id INT REFERENCES users(id),
    message TEXT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Notifications
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    title VARCHAR(255),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Chat System
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INT REFERENCES users(id),
    receiver_id INT REFERENCES users(id),
    message TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Partner Pharmacies and Medicines
CREATE TABLE partner_pharmacies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    contact_number VARCHAR(20),
    location TEXT
);

CREATE TABLE partner_medicines (
    id SERIAL PRIMARY KEY,
    partner_id INT REFERENCES partner_pharmacies(id),
    medicine_name VARCHAR(100),
    strength VARCHAR(50),
    price NUMERIC(10,2),
    availability BOOLEAN
);

-- 12. GPS Location
CREATE TABLE pharmacy_locations (
    id SERIAL PRIMARY KEY,
    pharmacy_name VARCHAR(100),
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    address TEXT
);

-- Insert default roles
INSERT INTO roles (name) VALUES 
('Admin'),
('Manager'),
('Technician Pharmacist'),
('Cashier'),
('Delivery Person');