-- Step 1: DROP TABLES in correct order (because of foreign key dependencies)
-- use temp;
DROP TABLE IF EXISTS reportedlostfound;
DROP TABLE IF EXISTS claims;
DROP TABLE IF EXISTS lostitemphotos;
DROP TABLE IF EXISTS lostitems;
DROP TABLE IF EXISTS founditemphotos;
DROP TABLE IF EXISTS founditems;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS otp_verification;
DROP TABLE IF EXISTS users;
-- Step 2: CREATE TABLES with lowercase names and lowercase columns
-- USERS TABLE
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    profile_pic TEXT,
    password_hash TEXT NOT NULL,
    roll_number VARCHAR(20) UNIQUE,
    hostel VARCHAR(50),
    room_number VARCHAR(10),
    email_verified BOOLEAN DEFAULT FALSE
);
delete from users where user_id = 1;
-- OTP VERIFICATION TABLE
CREATE TABLE otp_verification (
    otp_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expires_at DATETIME NOT NULL
);

-- CATEGORIES TABLE
CREATE TABLE categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- FOUND ITEMS TABLE
CREATE TABLE founditems (
    found_item_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    found_date DATE NOT NULL,
    found_location VARCHAR(255) NOT NULL,
    pickup_location VARCHAR(255),
    security_question TEXT NOT NULL,
    security_answer_hash TEXT NOT NULL,
    posted_by INT,
    category_id INT,
    FOREIGN KEY (posted_by) REFERENCES users(user_id),
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

-- FOUND ITEM PHOTOS TABLE
CREATE TABLE founditemphotos (
    photo_id INT PRIMARY KEY AUTO_INCREMENT,
    found_item_id INT,
    photo_url TEXT,
    FOREIGN KEY (found_item_id) REFERENCES founditems(found_item_id)
);

CREATE TABLE lostitems (
    lost_item_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    lost_date DATE NOT NULL,
    lost_location VARCHAR(255),
    posted_by INT,
    category_id INT,
    FOREIGN KEY (posted_by) REFERENCES users(user_id),
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

-- LOST ITEM PHOTOS TABLE
CREATE TABLE lostitemphotos (
    photo_id INT PRIMARY KEY AUTO_INCREMENT,
    lost_item_id INT,
    photo_url TEXT,
    FOREIGN KEY (lost_item_id) REFERENCES lostitems(lost_item_id)
);

-- CLAIMS TABLE
CREATE TABLE claims (
    claim_id INT PRIMARY KEY AUTO_INCREMENT,
    found_item_id INT,
    claiming_user_id INT,
    security_answer_attempt TEXT,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (found_item_id) REFERENCES founditems(found_item_id),
    FOREIGN KEY (claiming_user_id) REFERENCES users(user_id)
);


-- REPORTED LOST FOUND TABLE
CREATE TABLE reportedlostfound (
    report_id INT PRIMARY KEY AUTO_INCREMENT,
    lost_item_id INT,
    message TEXT,
    status ENUM('Pending', 'Returned') DEFAULT 'Pending',
    user_who_found INT,
    pickup_location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lost_item_id) REFERENCES lostitems(lost_item_id),
    FOREIGN KEY (user_who_found) REFERENCES users(user_id)
);
