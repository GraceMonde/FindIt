CREATE DATABASE IF NOT EXISTS lost_and_found;

USE lost_and_found;

SET NAMES utf8mb4;
SET character_set_client = utf8mb4;

CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    profile_image_url TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_student_id (student_id)
);

CREATE TABLE IF NOT EXISTS track_record(
    track_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    items_lost INT DEFAULT 0,
    items_found INT DEFAULT 0,
    items_returned INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    INDEX idx_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

INSERT INTO categories (category_name, description) VALUES
('Electronics', 'Devices like phones, laptops, etc.'),
('Clothing', 'Apparel such as shirts, jackets, and shoes'),
('Books', 'Printed or written literary materials'),
('Documents', 'ID cards, certificates, papers'),
('Keys', 'House, car, or office keys'),
('Accessories', 'Jewelry, watches, sunglasses, etc.'),
('School Supplies', 'Stationery and educational materials'),
('Other', 'Items that does not fit in other categories');

CREATE TABLE IF NOT EXISTS locations (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    location_name VARCHAR(100) UNIQUE NOT NULL
);

INSERT INTO locations (location_name) VALUES
('School of Agricultural Sciences'),
('School of Education'),
('Graduate School of Business'),
('School of Engineering'),
('School of Humanities and Social Sciences'),
('School of Law'),
('School of Mines'),
('School of Natural Sciences and Applied Sciences'),
('School of Veterinary Medicine'),
('Main Library'),
('Sports hall'),
('Other');

CREATE TABLE IF NOT EXISTS lost_items (
    lost_item_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category_id INT NULL,
    last_seen_location_id INT,
    last_seen_location_description TEXT,
    date_last_seen DATE,
    time_last_seen TIMESTAMP,
    status ENUM('Open', 'Claimed', 'Resolved') DEFAULT 'Open',
    additional_contact_info VARCHAR(255),
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
    FOREIGN KEY (last_seen_location_id) REFERENCES locations(location_id) ON DELETE SET NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_category (category_id),
    INDEX idx_location (last_seen_location_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_time_last_seen (time_last_seen),
    FULLTEXT idx_search (title, description)
);

CREATE TABLE IF NOT EXISTS found_items (
    found_item_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category_id INT NULL,
    location_found_id INT,
    location_found_description TEXT,
    time_found TIMESTAMP,
    status ENUM('Available', 'Claimed', 'Returned') DEFAULT 'Available',
    additional_contact_info TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,

    question_one TEXT NOT NULL,
    answer_one TEXT NOT NULL,
    question_two TEXT NOT NULL,
    answer_two TEXT NOT NULL,
    question_three TEXT NOT NULL,
    answer_three TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
    FOREIGN KEY (location_found_id) REFERENCES locations(location_id) ON DELETE SET NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_category (category_id),
    INDEX idx_location (location_found_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_time_found (time_found),
    FULLTEXT idx_search (title, description)
);

CREATE TABLE IF NOT EXISTS item_images (
    image_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    lost_item_id VARCHAR(36),
    image_url TEXT NOT NULL,
    upload_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (lost_item_id) REFERENCES lost_items(lost_item_id) ON DELETE CASCADE,
    
    CHECK (lost_item_id IS NOT NULL),
    
    INDEX idx_lost_item (lost_item_id)
);

CREATE TABLE IF NOT EXISTS claims (
    claim_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    found_item_id VARCHAR(36) NOT NULL,
    claimant_id VARCHAR(36) NOT NULL,
    claimant_name VARCHAR(100) NOT NULL,
    finder_id VARCHAR(36) NOT NULL,
    finder_name VARCHAR(100) NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected', 'Completed') DEFAULT 'Pending',
    
    question_one TEXT,
    answer_1 TEXT,
    question_two TEXT,
    answer_2 TEXT,
    question_three TEXT,
    answer_3 TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,

    image_url VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (found_item_id) REFERENCES found_items(found_item_id) ON DELETE CASCADE,
    FOREIGN KEY (claimant_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (finder_id) REFERENCES users(user_id) ON DELETE CASCADE,
    
    INDEX idx_claimant (claimant_id),
    INDEX idx_finder (finder_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Automatically create a track_record when a new user is added
DELIMITER //
CREATE TRIGGER after_user_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
  INSERT INTO track_record (user_id)
  VALUES (NEW.user_id);
END;
//
DELIMITER ;

-- 2. Increment items_lost when a lost item is posted
DELIMITER //
CREATE TRIGGER after_lost_item_insert
AFTER INSERT ON lost_items
FOR EACH ROW
BEGIN
  UPDATE track_record
  SET items_lost = items_lost + 1
  WHERE user_id = NEW.user_id;
END;
//
DELIMITER ;

-- 3. Increment items_found when a found item is posted
DELIMITER //
CREATE TRIGGER after_found_item_insert
AFTER INSERT ON found_items
FOR EACH ROW
BEGIN
  UPDATE track_record
  SET items_found = items_found + 1
  WHERE user_id = NEW.user_id;
END;
//
DELIMITER ;

-- 4. Increment items_returned when a claim is updated to Completed
DELIMITER //
CREATE TRIGGER after_claim_completed
AFTER UPDATE ON claims
FOR EACH ROW
BEGIN
  IF NEW.status = 'Completed' AND OLD.status != 'Completed' THEN
    UPDATE track_record
    SET items_returned = items_returned + 1
    WHERE user_id = NEW.finder_id;
  END IF;
END;
//
DELIMITER ;
