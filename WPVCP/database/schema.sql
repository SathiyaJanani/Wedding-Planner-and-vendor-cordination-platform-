-- =====================================================================
-- Wedding Planner and Vendor Coordination Platform (WPVCP)
-- Relational Database Schema (MySQL 8.0+)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `wedding_planner` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `wedding_planner`;

-- Disable FK checks temporarily for safe clean rebuilds
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `chatbot_messages`;
DROP TABLE IF EXISTS `chatbot_conversations`;
DROP TABLE IF EXISTS `support_requests`;
DROP TABLE IF EXISTS `wishlists`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `messages`;
DROP TABLE IF EXISTS `conversations`;
DROP TABLE IF EXISTS `documents`;
DROP TABLE IF EXISTS `wedding_schedule`;
DROP TABLE IF EXISTS `budget_items`;
DROP TABLE IF EXISTS `budgets`;
DROP TABLE IF EXISTS `invoices`;
DROP TABLE IF EXISTS `payment_transactions`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `booking_services`;
DROP TABLE IF EXISTS `bookings`;
DROP TABLE IF EXISTS `vendor_requests`;
DROP TABLE IF EXISTS `vendor_availability`;
DROP TABLE IF EXISTS `wedding_requirements`;
DROP TABLE IF EXISTS `wedding_projects`;
DROP TABLE IF EXISTS `customers`;
DROP TABLE IF EXISTS `vendor_services`;
DROP TABLE IF EXISTS `vendors`;
DROP TABLE IF EXISTS `service_categories`;
DROP TABLE IF EXISTS `planners`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `roles`;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- 1. ROLES TABLE
-- ---------------------------------------------------------------------
CREATE TABLE `roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` ENUM('ADMIN', 'PLANNER', 'VENDOR', 'CUSTOMER') NOT NULL UNIQUE,
  `description` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 2. USERS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NULL,
  `role_id` INT NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(30) NULL,
  `avatar_url` VARCHAR(255) NULL,
  `auth_provider` ENUM('local', 'google') NOT NULL DEFAULT 'local',
  `google_id` VARCHAR(191) NULL UNIQUE,
  `email_verified` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role_id`),
  INDEX `idx_users_email` (`email`),
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. PLANNERS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE `planners` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `agency_name` VARCHAR(150) NOT NULL DEFAULT 'Elite Wedding Planners',
  `bio` TEXT NULL,
  `experience_years` INT NOT NULL DEFAULT 5,
  `contact_phone` VARCHAR(30) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_planners_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 4. SERVICE CATEGORIES TABLE
-- ---------------------------------------------------------------------
CREATE TABLE `service_categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `icon` VARCHAR(50) NULL DEFAULT 'Sparkles',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 5. VENDORS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE `vendors` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `business_name` VARCHAR(150) NOT NULL,
  `category_id` INT NOT NULL,
  `description` TEXT NULL,
  `experience_years` INT NOT NULL DEFAULT 3,
  `address` VARCHAR(255) NULL,
  `city` VARCHAR(100) NOT NULL DEFAULT 'Bangalore',
  `state` VARCHAR(100) NOT NULL DEFAULT 'Karnataka',
  `postal_code` VARCHAR(20) NULL,
  `latitude` DECIMAL(10,8) NULL,
  `longitude` DECIMAL(11,8) NULL,
  `service_locations` VARCHAR(255) NULL DEFAULT 'Bangalore, Chennai, Hyderabad',
  `base_price` DECIMAL(12,2) NOT NULL DEFAULT 25000.00,
  `price_range` VARCHAR(100) NULL DEFAULT '₹25,000 - ₹1,50,000',
  `rating` DECIMAL(3,2) NOT NULL DEFAULT 4.80,
  `total_reviews` INT NOT NULL DEFAULT 0,
  `is_verified` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_vendors_category` (`category_id`),
  INDEX `idx_vendors_city` (`city`),
  CONSTRAINT `fk_vendors_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_vendors_category` FOREIGN KEY (`category_id`) REFERENCES `service_categories` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 6. VENDOR SERVICES TABLE (Catalog items per vendor)
-- ---------------------------------------------------------------------
CREATE TABLE `vendor_services` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `vendor_id` INT NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT NULL,
  `price` DECIMAL(12,2) NOT NULL,
  `pricing_unit` VARCHAR(50) NOT NULL DEFAULT 'per_event', -- 'per_event', 'per_day', 'per_plate', 'per_hour'
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_vendor_services_vendor` (`vendor_id`),
  CONSTRAINT `fk_vendor_services_vendor` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 7. CUSTOMERS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE `customers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `partner_name` VARCHAR(150) NULL,
  `wedding_date` DATE NULL,
  `city` VARCHAR(100) NULL DEFAULT 'Bangalore',
  `state` VARCHAR(100) NULL DEFAULT 'Karnataka',
  `address` VARCHAR(255) NULL,
  `wedding_theme` VARCHAR(100) NULL DEFAULT 'Royal Traditional',
  `guest_count` INT NULL DEFAULT 350,
  `estimated_budget` DECIMAL(12,2) NULL DEFAULT 1200000.00,
  `planner_id` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_customers_planner` (`planner_id`),
  CONSTRAINT `fk_customers_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_customers_planner` FOREIGN KEY (`planner_id`) REFERENCES `planners` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 8. WEDDING PROJECTS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE `wedding_projects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_code` VARCHAR(50) NOT NULL UNIQUE,
  `customer_id` INT NOT NULL,
  `planner_id` INT NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `wedding_date` DATE NOT NULL,
  `venue_name` VARCHAR(200) NULL,
  `venue_address` VARCHAR(255) NULL,
  `city` VARCHAR(100) NOT NULL DEFAULT 'Bangalore',
  `guest_count` INT NOT NULL DEFAULT 300,
  `total_budget` DECIMAL(12,2) NOT NULL DEFAULT 1000000.00,
  `status` ENUM('PLANNING', 'IN_PROGRESS', 'CONFIRMED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PLANNING',
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_wedding_projects_customer` (`customer_id`),
  INDEX `idx_wedding_projects_planner` (`planner_id`),
  INDEX `idx_wedding_projects_date` (`wedding_date`),
  CONSTRAINT `fk_projects_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_projects_planner` FOREIGN KEY (`planner_id`) REFERENCES `planners` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 9. WEDDING REQUIREMENTS TABLE (Submitted by Customer)
-- ---------------------------------------------------------------------
CREATE TABLE `wedding_requirements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_id` INT NOT NULL,
  `wedding_project_id` INT NULL,
  `wedding_date` DATE NOT NULL,
  `location` VARCHAR(150) NOT NULL,
  `guest_count` INT NOT NULL DEFAULT 300,
  `estimated_budget` DECIMAL(12,2) NOT NULL,
  `required_services` JSON NOT NULL, -- Array of category slugs / names
  `special_preferences` TEXT NULL,
  `status` ENUM('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'CONVERTED_TO_PROJECT', 'REJECTED') NOT NULL DEFAULT 'DRAFT',
  `verification_status` ENUM('VERIFIED', 'PENDING_PLANNER_VERIFICATION', 'DECLINED', 'DRAFT') NOT NULL DEFAULT 'VERIFIED',
  `last_edited_by` ENUM('CUSTOMER', 'PLANNER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
  `change_summary` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_requirements_customer` (`customer_id`),
  INDEX `idx_requirements_project` (`wedding_project_id`),
  CONSTRAINT `fk_requirements_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_requirements_project` FOREIGN KEY (`wedding_project_id`) REFERENCES `wedding_projects` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 10. VENDOR AVAILABILITY TABLE
-- ---------------------------------------------------------------------
CREATE TABLE `vendor_availability` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `vendor_id` INT NOT NULL,
  `date` DATE NOT NULL,
  `start_time` TIME NOT NULL DEFAULT '08:00:00',
  `end_time` TIME NOT NULL DEFAULT '22:00:00',
  `status` ENUM('AVAILABLE', 'UNAVAILABLE', 'BOOKED', 'RESERVED') NOT NULL DEFAULT 'AVAILABLE',
  `reason` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_vendor_date_time` (`vendor_id`, `date`, `start_time`, `end_time`),
  INDEX `idx_availability_vendor_date` (`vendor_id`, `date`),
  CONSTRAINT `fk_availability_vendor` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 11. VENDOR REQUESTS TABLE (Sent ONLY by Planner to Vendor)
-- ---------------------------------------------------------------------
CREATE TABLE `vendor_requests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `request_code` VARCHAR(50) NOT NULL UNIQUE,
  `wedding_project_id` INT NOT NULL,
  `planner_id` INT NOT NULL,
  `vendor_id` INT NOT NULL,
  `service_id` INT NULL,
  `event_date` DATE NOT NULL,
  `start_time` TIME NOT NULL DEFAULT '09:00:00',
  `end_time` TIME NOT NULL DEFAULT '21:00:00',
  `proposed_price` DECIMAL(12,2) NOT NULL,
  `notes` TEXT NULL,
  `status` ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
  `decline_reason` TEXT NULL,
  `responded_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_vrequests_project` (`wedding_project_id`),
  INDEX `idx_vrequests_planner` (`planner_id`),
  INDEX `idx_vrequests_vendor` (`vendor_id`),
  INDEX `idx_vrequests_status` (`status`),
  CONSTRAINT `fk_vrequests_project` FOREIGN KEY (`wedding_project_id`) REFERENCES `wedding_projects` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_vrequests_planner` FOREIGN KEY (`planner_id`) REFERENCES `planners` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_vrequests_vendor` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_vrequests_service` FOREIGN KEY (`service_id`) REFERENCES `vendor_services` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 12. BOOKINGS TABLE (Overall project booking state)
-- ---------------------------------------------------------------------
CREATE TABLE `bookings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `booking_code` VARCHAR(50) NOT NULL UNIQUE,
  `wedding_project_id` INT NOT NULL UNIQUE,
  `customer_id` INT NOT NULL,
  `planner_id` INT NOT NULL,
  `total_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `advance_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `paid_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `status` ENUM(
    'DRAFT',
    'REQUESTED',
    'PENDING_VENDOR_RESPONSE',
    'VENDOR_ACCEPTED',
    'CUSTOMER_APPROVAL',
    'PAYMENT_PENDING',
    'PARTIALLY_PAID',
    'FULLY_PAID',
    'CONFIRMED',
    'SERVICE_IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
  ) NOT NULL DEFAULT 'DRAFT',
  `customer_feedback` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_bookings_customer` (`customer_id`),
  INDEX `idx_bookings_planner` (`planner_id`),
  INDEX `idx_bookings_status` (`status`),
  CONSTRAINT `fk_bookings_project` FOREIGN KEY (`wedding_project_id`) REFERENCES `wedding_projects` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_bookings_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_bookings_planner` FOREIGN KEY (`planner_id`) REFERENCES `planners` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 13. BOOKING SERVICES TABLE (Individual vendor services arranged in a booking)
-- ---------------------------------------------------------------------
CREATE TABLE `booking_services` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `booking_id` INT NOT NULL,
  `vendor_id` INT NOT NULL,
  `vendor_request_id` INT NULL,
  `service_id` INT NULL,
  `service_name` VARCHAR(150) NOT NULL,
  `category_name` VARCHAR(100) NOT NULL,
  `agreed_price` DECIMAL(12,2) NOT NULL,
  `paid_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('PROPOSED', 'CUSTOMER_APPROVED', 'CUSTOMER_CHANGE_REQUESTED', 'CONFIRMED', 'COMPLETED') NOT NULL DEFAULT 'PROPOSED',
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_bs_booking` (`booking_id`),
  INDEX `idx_bs_vendor` (`vendor_id`),
  INDEX `idx_bs_request` (`vendor_request_id`),
  CONSTRAINT `fk_bs_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bs_vendor` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_bs_request` FOREIGN KEY (`vendor_request_id`) REFERENCES `vendor_requests` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_bs_service` FOREIGN KEY (`service_id`) REFERENCES `vendor_services` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 14. PAYMENTS TABLE (Milestones: Advance, Second Payment, Final Payment)
-- ---------------------------------------------------------------------
CREATE TABLE `payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `payment_code` VARCHAR(50) NOT NULL UNIQUE,
  `booking_id` INT NOT NULL,
  `booking_service_id` INT NULL,
  `wedding_project_id` INT NOT NULL,
  `customer_id` INT NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `milestone_name` VARCHAR(50) NOT NULL, -- e.g. 'Advance', 'Second Payment', 'Final Payment'
  `amount` DECIMAL(12,2) NOT NULL,
  `due_date` DATE NOT NULL,
  `status` ENUM('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_payments_booking` (`booking_id`),
  INDEX `idx_payments_customer` (`customer_id`),
  INDEX `idx_payments_status` (`status`),
  CONSTRAINT `fk_payments_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_payments_project` FOREIGN KEY (`wedding_project_id`) REFERENCES `wedding_projects` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_payments_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 15. PAYMENT TRANSACTIONS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE `payment_transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `payment_id` INT NOT NULL,
  `transaction_reference` VARCHAR(100) NOT NULL UNIQUE,
  `payment_method` ENUM('MOCK_CARD', 'MOCK_UPI', 'MOCK_NETBANKING', 'STRIPE', 'RAZORPAY') NOT NULL DEFAULT 'MOCK_UPI',
  `amount` DECIMAL(12,2) NOT NULL,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'INR',
  `status` ENUM('SUCCESS', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'SUCCESS',
  `gateway_response` JSON NULL,
  `paid_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_tx_payment` (`payment_id`),
  INDEX `idx_tx_ref` (`transaction_reference`),
  CONSTRAINT `fk_tx_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 16. INVOICES TABLE
-- ---------------------------------------------------------------------
CREATE TABLE `invoices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `invoice_number` VARCHAR(50) NOT NULL UNIQUE,
  `booking_id` INT NOT NULL,
  `payment_id` INT NULL,
  `issuer_id` INT NOT NULL, -- user_id of planner or vendor
  `recipient_id` INT NOT NULL, -- user_id of customer
  `subtotal` DECIMAL(12,2) NOT NULL,
  `tax_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `total_amount` DECIMAL(12,2) NOT NULL,
  `status` ENUM('ISSUED', 'PAID', 'CANCELLED') NOT NULL DEFAULT 'ISSUED',
  `due_date` DATE NOT NULL,
  `pdf_url` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_invoices_booking` (`booking_id`),
  INDEX `idx_invoices_recipient` (`recipient_id`),
  CONSTRAINT `fk_invoices_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_invoices_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_invoices_issuer` FOREIGN KEY (`issuer_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_invoices_recipient` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 17. BUDGETS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE `budgets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `wedding_project_id` INT NOT NULL UNIQUE,
  `total_budget` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `allocated_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `spent_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `remaining_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_budgets_project` FOREIGN KEY (`wedding_project_id`) REFERENCES `wedding_projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 18. BUDGET ITEMS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE `budget_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `budget_id` INT NOT NULL,
  `category_id` INT NULL,
  `item_name` VARCHAR(150) NOT NULL,
  `estimated_cost` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `actual_cost` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `paid_cost` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('PLANNED', 'BOOKED', 'PAID') NOT NULL DEFAULT 'PLANNED',
  `notes` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_budget_items_budget` (`budget_id`),
  CONSTRAINT `fk_budget_items_budget` FOREIGN KEY (`budget_id`) REFERENCES `budgets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_budget_items_category` FOREIGN KEY (`category_id`) REFERENCES `service_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 19. WEDDING SCHEDULE TABLE
-- ---------------------------------------------------------------------
CREATE TABLE `wedding_schedule` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `wedding_project_id` INT NOT NULL,
  `event_title` VARCHAR(150) NOT NULL,
  `event_date` DATE NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `location` VARCHAR(150) NULL,
  `description` TEXT NULL,
  `person_in_charge` VARCHAR(100) NULL,
  `vendor_id` INT NULL,
  `status` ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED') NOT NULL DEFAULT 'SCHEDULED',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_schedule_project` (`wedding_project_id`),
  INDEX `idx_schedule_date` (`event_date`),
  CONSTRAINT `fk_schedule_project` FOREIGN KEY (`wedding_project_id`) REFERENCES `wedding_projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_schedule_vendor` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 20. DOCUMENTS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE `documents` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `wedding_project_id` INT NULL,
  `uploader_id` INT NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `document_type` ENUM('CONTRACT', 'INVOICE', 'ID_PROOF', 'DESIGN_SKETCH', 'CHECKLIST', 'OTHER') NOT NULL DEFAULT 'OTHER',
  `file_path` VARCHAR(255) NOT NULL,
  `file_size` INT NOT NULL DEFAULT 0,
  `file_type` VARCHAR(100) NULL DEFAULT 'application/pdf',
  `status` ENUM('ACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_docs_project` (`wedding_project_id`),
  INDEX `idx_docs_uploader` (`uploader_id`),
  CONSTRAINT `fk_docs_project` FOREIGN KEY (`wedding_project_id`) REFERENCES `wedding_projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_docs_uploader` FOREIGN KEY (`uploader_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 21. CONVERSATIONS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE `conversations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `wedding_project_id` INT NULL,
  `participant_one_id` INT NOT NULL,
  `participant_two_id` INT NOT NULL,
  `last_message_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_conv_p1` (`participant_one_id`),
  INDEX `idx_conv_p2` (`participant_two_id`),
  INDEX `idx_conv_project` (`wedding_project_id`),
  CONSTRAINT `fk_conv_p1` FOREIGN KEY (`participant_one_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_conv_p2` FOREIGN KEY (`participant_two_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_conv_project` FOREIGN KEY (`wedding_project_id`) REFERENCES `wedding_projects` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 22. MESSAGES TABLE
-- ---------------------------------------------------------------------
CREATE TABLE `messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `conversation_id` INT NOT NULL,
  `sender_id` INT NOT NULL,
  `recipient_id` INT NOT NULL,
  `message_text` TEXT NOT NULL,
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `read_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_messages_conversation` (`conversation_id`),
  INDEX `idx_messages_sender` (`sender_id`),
  INDEX `idx_messages_recipient` (`recipient_id`),
  CONSTRAINT `fk_msg_conv` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_msg_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_msg_recipient` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 23. NOTIFICATIONS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `message` TEXT NOT NULL,
  `notification_type` ENUM(
    'REQUEST_NEW',
    'REQUEST_ACCEPTED',
    'REQUEST_DECLINED',
    'CUSTOMER_APPROVAL',
    'CUSTOMER_APPROVED',
    'CUSTOMER_CHANGE_REQUESTED',
    'PAYMENT_PENDING',
    'PAYMENT_SUCCESS',
    'PAYMENT_FAILED',
    'BOOKING_CONFIRMED',
    'SCHEDULE_UPDATE',
    'MESSAGE',
    'SERVICE_COMPLETED',
    'REVIEW_REQUESTED',
    'SYSTEM'
  ) NOT NULL DEFAULT 'SYSTEM',
  `reference_id` INT NULL,
  `reference_type` VARCHAR(50) NULL,
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_notif_user` (`user_id`),
  INDEX `idx_notif_read` (`is_read`),
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 24. REVIEWS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE `reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `wedding_project_id` INT NULL,
  `booking_id` INT NULL,
  `customer_id` INT NOT NULL,
  `vendor_id` INT NULL,
  `planner_id` INT NULL,
  `rating` INT NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
  `review_text` TEXT NOT NULL,
  `response_text` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_reviews_vendor` (`vendor_id`),
  INDEX `idx_reviews_planner` (`planner_id`),
  INDEX `idx_reviews_customer` (`customer_id`),
  CONSTRAINT `fk_reviews_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_vendor` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_planner` FOREIGN KEY (`planner_id`) REFERENCES `planners` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_reviews_project` FOREIGN KEY (`wedding_project_id`) REFERENCES `wedding_projects` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_reviews_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 25. WISHLISTS TABLE (Customer saved vendors/services)
-- ---------------------------------------------------------------------
CREATE TABLE `wishlists` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_id` INT NOT NULL,
  `vendor_id` INT NULL,
  `service_id` INT NULL,
  `notes` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_wishlists_customer` (`customer_id`),
  CONSTRAINT `fk_wishlists_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_wishlists_vendor` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_wishlists_service` FOREIGN KEY (`service_id`) REFERENCES `vendor_services` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 26. SUPPORT REQUESTS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE `support_requests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `booking_id` INT NULL,
  `ticket_number` VARCHAR(50) NOT NULL UNIQUE,
  `subject` VARCHAR(150) NOT NULL,
  `category` ENUM('TECHNICAL', 'BILLING', 'VENDOR_DISPUTE', 'ACCOUNT', 'GENERAL') NOT NULL DEFAULT 'GENERAL',
  `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
  `status` ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
  `assigned_to` INT NULL,
  `message` TEXT NOT NULL,
  `resolution_notes` TEXT NULL,
  `resolved_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_support_user` (`user_id`),
  INDEX `idx_support_booking` (`booking_id`),
  INDEX `idx_support_status` (`status`),
  CONSTRAINT `fk_support_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 27. CHATBOT CONVERSATIONS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE `chatbot_conversations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `session_token` VARCHAR(100) NOT NULL,
  `title` VARCHAR(150) NOT NULL DEFAULT 'Wedding Assistant Session',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_cb_user` (`user_id`),
  CONSTRAINT `fk_cb_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 28. CHATBOT MESSAGES TABLE
-- ---------------------------------------------------------------------
CREATE TABLE `chatbot_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `conversation_id` INT NOT NULL,
  `sender` ENUM('USER', 'BOT') NOT NULL,
  `message_text` TEXT NOT NULL,
  `metadata` JSON NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_cbm_conversation` (`conversation_id`),
  CONSTRAINT `fk_cbm_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `chatbot_conversations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;
