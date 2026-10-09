-- =====================================================================
-- Wedding Planner and Vendor Coordination Platform (WPVCP)
-- Production Seed / Sample Data
-- Password for all users: 12345689 (also backward-compatible with password123)
-- Phone for all users: 1234568912
-- Idempotent: Can be run repeatedly without creating duplicates
-- =====================================================================

USE `wedding_planner`;

-- 1. ROLES
INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'ADMIN', 'Executive platform super administrator and system auditor'),
(2, 'PLANNER', 'Platform administrator and wedding coordinator'),
(3, 'VENDOR', 'Service provider accepting planner requests and bookings'),
(4, 'CUSTOMER', 'Couple submitting requirements and approving arrangements')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- 2. SERVICE CATEGORIES (Strictly 15 separate database-driven categories)
INSERT INTO `service_categories` (`id`, `name`, `slug`, `description`, `icon`) VALUES
(1, 'Wedding Halls', 'wedding-hall', 'Luxury convention centers, heritage palaces, and open-air lawns', 'Building2'),
(2, 'Catering', 'catering', 'Gourmet vegetarian and multi-cuisine culinary banquets', 'Utensils'),
(3, 'Decoration', 'decoration', 'Floral stages, theme mandates, entrance gates, and lighting', 'Palette'),
(4, 'Photography', 'photography', 'Candid, traditional portraits, drone coverage, and photobooks', 'Camera'),
(5, 'Videography', 'videography', 'Cinematic 4K wedding films, teasers, and livestreaming', 'Video'),
(6, 'Makeup', 'makeup', 'Bridal makeover, HD airbrush makeup, and hair styling', 'Heart'),
(7, 'Mehendi', 'mehendi', 'Intricate bridal henna, Rajasthani, and Arabic mehendi artistry', 'Sparkles'),
(8, 'Bridal Wear', 'bridal-wear', 'Designer bridal lehengas, Kanjeevaram sarees, and gowns', 'Crown'),
(9, 'Groom Wear', 'groom-wear', 'Bespoke sherwanis, bandhgalas, tuxedos, and safas', 'Shirt'),
(10, 'Invitation', 'invitation', 'Custom engraved physical invites, e-invites, and wax seals', 'Mail'),
(11, 'Jewellery', 'jewellery', 'Heirloom gold, diamond, kundan, and antique bridal jewellery sets', 'Award'),
(12, 'Wedding Cakes', 'wedding-cakes', 'Multi-tiered designer wedding cakes, fondant crafts, and dessert bars', 'Cake'),
(13, 'Music & DJ', 'music-dj', 'High-energy sound systems, LED dance floors, live fusion, and DJ mixes', 'Disc'),
(14, 'Transportation', 'transportation', 'Vintage convertibles, luxury sedans, and guest coaches', 'Car'),
(15, 'Florists', 'florists', 'Exotic imported blooms, fresh jasmine garlands, and floral mandaps', 'Flower2')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `slug` = VALUES(`slug`), `description` = VALUES(`description`), `icon` = VALUES(`icon`);

-- Common bcrypt hash for '12345689':
-- $2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK

-- 3. USERS
-- 5 Admins, 1 Planner, 5 Customers, and 45 Vendors across 15 categories
INSERT INTO `users` (`id`, `email`, `password_hash`, `role_id`, `full_name`, `phone`, `auth_provider`, `email_verified`, `is_active`) VALUES
-- 5 ADMINS (IDs 1-5)
(1, 'archive_admin@weddingplanner.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 1, 'sathiyajanani', '1234568912', 'google', TRUE, TRUE),
(2, 'admin@wedding.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 1, 'Executive Administrator', '1234568912', 'local', TRUE, TRUE),
(3, 'admin.kavitha@wedding.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 1, 'Kavitha Admin', '1234568912', 'local', TRUE, TRUE),
(4, 'admin.rajesh@wedding.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 1, 'Rajesh Admin', '1234568912', 'local', TRUE, TRUE),
(5, 'admin.meenakshi@wedding.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 1, 'Meenakshi Admin', '1234568912', 'local', TRUE, TRUE),

-- 1 PLANNER (ID 6)
(6, 'sathiyajani1112@gmail.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 2, 'Priya Sharma', '1234568912', 'local', TRUE, TRUE),

-- 5 CUSTOMERS (IDs 7-11) - Required names: Barani, Malini, Loha, Ranjani, Siva
(7, 'barani@gmail.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 4, 'Barani', '1234568912', 'local', TRUE, TRUE),
(8, 'malini@gmail.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 4, 'Malini', '1234568912', 'local', TRUE, TRUE),
(9, 'loha@gmail.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 4, 'Loha', '1234568912', 'local', TRUE, TRUE),
(10, 'ranjani@gmail.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 4, 'Ranjani', '1234568912', 'local', TRUE, TRUE),
(11, 'siva@gmail.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 4, 'Siva', '1234568912', 'local', TRUE, TRUE),

-- 45 VENDORS (IDs 12-56)
-- Cat 1: Wedding Halls (IDs 12-14)
(12, 'grandpalace@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Sanjay Singhania', '1234568912', 'local', TRUE, TRUE),
(13, 'manphocentre@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Arun Manpho', '1234568912', 'local', TRUE, TRUE),
(14, 'itcballroom@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Rohit Khanna', '1234568912', 'local', TRUE, TRUE),

-- Cat 2: Catering (IDs 15-17)
(15, 'royalcatering@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Chef Rajesh Nair', '1234568912', 'local', TRUE, TRUE),
(16, 'krishnacatering@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Venkatesh Bhat', '1234568912', 'local', TRUE, TRUE),
(17, 'saffronspice@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Chef Anand Kumar', '1234568912', 'local', TRUE, TRUE),

-- Cat 3: Decoration (IDs 18-20)
(18, 'floral@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Ananya Roy', '1234568912', 'local', TRUE, TRUE),
(19, 'mayuradecor@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Manoj Verma', '1234568912', 'local', TRUE, TRUE),
(20, 'celestialdecor@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Divya Patel', '1234568912', 'local', TRUE, TRUE),

-- Cat 4: Photography (IDs 21-23)
(21, 'shutter@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Vikram Rathore', '1234568912', 'local', TRUE, TRUE),
(22, 'candidcanvas@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Rohit Shetty', '1234568912', 'local', TRUE, TRUE),
(23, 'lightshadows@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Deepak Joshi', '1234568912', 'local', TRUE, TRUE),

-- Cat 5: Videography (IDs 24-26)
(24, 'cinematicvows@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Karan Malhotra', '1234568912', 'local', TRUE, TRUE),
(25, 'auramotion@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Naveen Kumar', '1234568912', 'local', TRUE, TRUE),
(26, 'heirloomreel@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Siddharth Das', '1234568912', 'local', TRUE, TRUE),

-- Cat 6: Makeup (IDs 27-29)
(27, 'glamour@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Kavita Menon', '1234568912', 'local', TRUE, TRUE),
(28, 'radiancemakeup@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Meera Swaminathan', '1234568912', 'local', TRUE, TRUE),
(29, 'bellabridal@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Shalini Sen', '1234568912', 'local', TRUE, TRUE),

-- Cat 7: Mehendi (IDs 30-32)
(30, 'henna@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Fatima Sheikh', '1234568912', 'local', TRUE, TRUE),
(31, 'royalhenna@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Sunita Gehlot', '1234568912', 'local', TRUE, TRUE),
(32, 'marigoldhenna@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Pooja Agarwal', '1234568912', 'local', TRUE, TRUE),

-- Cat 8: Bridal Wear (IDs 33-35)
(33, 'royalcouture@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Sunita Varma', '1234568912', 'local', TRUE, TRUE),
(34, 'kanchipuramsilk@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Ranganathan Chettiar', '1234568912', 'local', TRUE, TRUE),
(35, 'aanyadesigner@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Aanya Singhania', '1234568912', 'local', TRUE, TRUE),

-- Cat 9: Groom Wear (IDs 36-38)
(36, 'imperialsherwani@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Aditya Singhal', '1234568912', 'local', TRUE, TRUE),
(37, 'royalsafa@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Harish Rao', '1234568912', 'local', TRUE, TRUE),
(38, 'maharajamenswear@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Gautam Saxena', '1234568912', 'local', TRUE, TRUE),

-- Cat 10: Invitation (IDs 39-41)
(39, 'royalinvites@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Suresh Mittal', '1234568912', 'local', TRUE, TRUE),
(40, 'papergoldinvites@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Ritika Bansal', '1234568912', 'local', TRUE, TRUE),
(41, 'heritagepress@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Kailash Jain', '1234568912', 'local', TRUE, TRUE),

-- Cat 11: Jewellery (IDs 42-44)
(42, 'alankarjewels@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Mohanlal Jewellers', '1234568912', 'local', TRUE, TRUE),
(43, 'shringarjewels@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Geeta Chordia', '1234568912', 'local', TRUE, TRUE),
(44, 'navratnajewels@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Premchand Gupta', '1234568912', 'local', TRUE, TRUE),

-- Cat 12: Wedding Cakes (IDs 45-47)
(45, 'sweettiercakes@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Natasha Roy', '1234568912', 'local', TRUE, TRUE),
(46, 'velvetcrust@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'David Fernandez', '1234568912', 'local', TRUE, TRUE),
(47, 'sugarblossom@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Rashmi Prabhu', '1234568912', 'local', TRUE, TRUE),

-- Cat 13: Music & DJ (IDs 48-50)
(48, 'djbeats@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'DJ Rohit Roy', '1234568912', 'local', TRUE, TRUE),
(49, 'symphony@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Mahesh Iyer', '1234568912', 'local', TRUE, TRUE),
(50, 'soundwave@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'DJ Nikhil', '1234568912', 'local', TRUE, TRUE),

-- Cat 14: Transportation (IDs 51-53)
(51, 'royalcars@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Karthik Reddy', '1234568912', 'local', TRUE, TRUE),
(52, 'vintagecars@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Sanjay Deshmukh', '1234568912', 'local', TRUE, TRUE),
(53, 'grandluxurytrans@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Murugan Transports', '1234568912', 'local', TRUE, TRUE),

-- Cat 15: Florists (IDs 54-56)
(54, 'petalsstems@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Farhan Baig', '1234568912', 'local', TRUE, TRUE),
(55, 'gardeniaflorals@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Shanti Swamy', '1234568912', 'local', TRUE, TRUE),
(56, 'vedicflorals@vendor.com', '$2a$10$DMahM2YjBCCYgdTIF30ceuJPmDnNY.AfRv6qZ63jCFro.psUgtgTK', 3, 'Subramanian Chettiar', '1234568912', 'local', TRUE, TRUE)
ON DUPLICATE KEY UPDATE 
  `full_name` = VALUES(`full_name`),
  `role_id` = VALUES(`role_id`),
  `phone` = VALUES(`phone`),
  `password_hash` = VALUES(`password_hash`),
  `is_active` = TRUE,
  `email_verified` = TRUE;

-- 4. PLANNERS
INSERT INTO `planners` (`id`, `user_id`, `agency_name`, `bio`, `experience_years`, `contact_phone`) VALUES
(1, 6, 'Vows & Veils Signature Weddings', 'Lead destination wedding architect with over 10 years curating bespoke royal celebrations across South Asia.', 10, '1234568912')
ON DUPLICATE KEY UPDATE `agency_name` = VALUES(`agency_name`), `contact_phone` = VALUES(`contact_phone`);

-- 5. CUSTOMERS (Barani, Malini, Loha, Ranjani, Siva)
INSERT INTO `customers` (`id`, `user_id`, `partner_name`, `wedding_date`, `city`, `state`, `address`, `wedding_theme`, `guest_count`, `estimated_budget`, `planner_id`) VALUES
(1, 7, 'Anita', '2026-11-20', 'Bangalore', 'Karnataka', '74 Sadashivnagar', 'Royal Heritage & Florals', 450, 1500000.00, 1),
(2, 8, 'Sneha', '2026-12-05', 'Bangalore', 'Karnataka', '102 Whitefield Main Rd', 'Bohemian Pastel Garden', 350, 1200000.00, 1),
(3, 9, 'Pooja', '2026-12-18', 'Bangalore', 'Karnataka', '55 JP Nagar Phase 6', 'Traditional South Indian Temple Style', 500, 1800000.00, 1),
(4, 10, 'Meera', '2027-01-15', 'Bangalore', 'Karnataka', '18 Cunningham Road', 'Modern Minimalist Luxury', 300, 1100000.00, 1),
(5, 11, 'Deepika', '2027-02-10', 'Bangalore', 'Karnataka', '84 Benson Town', 'Grand Bollywood Glitz', 600, 2200000.00, 1)
ON DUPLICATE KEY UPDATE `partner_name` = VALUES(`partner_name`), `city` = VALUES(`city`);

-- 6. VENDORS (Strictly 15 Categories x 3 Vendors = 45 Vendors)
-- Preserving existing vendor names and formatting
INSERT INTO `vendors` (`id`, `user_id`, `business_name`, `category_id`, `description`, `experience_years`, `address`, `city`, `state`, `postal_code`, `latitude`, `longitude`, `service_locations`, `base_price`, `price_range`, `rating`, `total_reviews`, `is_verified`) VALUES
-- Category 1: Wedding Halls (Lat/Lng configured for Google Maps)
(1, 12, 'The Grand Royal Palace & Convention', 1, 'Palatial heritage venue featuring 2500-capacity pillarless banquet halls, lush manicured lawns, and deluxe bridal suites.', 15, '88 Palace Cross Road, Vasanth Nagar', 'Bangalore', 'Karnataka', '560020', 12.99820000, 77.59210000, 'Bangalore', 350000.00, '₹3,50,000 - ₹12,00,000', 4.95, 64, TRUE),
(2, 13, 'Manpho Convention Centre & Royal Lawns', 1, 'Sprawling 7-acre wedding destination with dual grand auditoriums, poolside cocktail patio, and dedicated parking for 1000 vehicles.', 12, '90/1 Veerannapalya, Nagavara Outer Ring Road', 'Bangalore', 'Karnataka', '560045', 13.04500000, 77.62000000, 'Bangalore', 280000.00, '₹2,80,000 - ₹8,50,000', 4.90, 47, TRUE),
(3, 14, 'ITC Windsor Heritage Ballroom', 1, 'Timeless British colonial style grand ballroom with crystal chandeliers, regal woodwork, and bespoke five-star hospitality services.', 20, '25 Golf Course Road, Sankey Road', 'Bangalore', 'Karnataka', '560052', 12.99500000, 77.58700000, 'Bangalore', 420000.00, '₹4,20,000 - ₹15,00,000', 4.98, 89, TRUE),

-- Category 2: Catering (ONLY Catering vendors)
(4, 15, 'Royal Feast Gourmet Caterers', 2, 'Authentic multi-course feasts spanning South Indian traditional plantain leaf, North Indian royal cuisine, and live continental counters.', 12, '19 Jayanagar 7th Block', 'Bangalore', 'Karnataka', '560070', NULL, NULL, 'Bangalore, Mysore', 650.00, '₹650 - ₹1,800 per plate', 4.88, 52, TRUE),
(5, 16, 'Sri Krishna Grand Traditional Caterers', 2, 'Master chefs specializing in pure ghee authentic Madhwa and Brahmin ceremonial banquets, live hot jalebi, and dosas.', 18, '44 Gandhi Bazaar Main Road, Basavanagudi', 'Bangalore', 'Karnataka', '560004', NULL, NULL, 'Bangalore, Hassan', 550.00, '₹550 - ₹1,200 per plate', 4.92, 73, TRUE),
(6, 17, 'Saffron & Spice Luxury Banquets', 2, 'Contemporary global cuisine, Mughlai tandoor stations, live sushi bar, woodfired artisanal pizzas, and signature mocktails.', 10, '120 100ft Road, Indiranagar', 'Bangalore', 'Karnataka', '560038', NULL, NULL, 'Bangalore, Chennai', 750.00, '₹750 - ₹2,200 per plate', 4.85, 41, TRUE),

-- Category 3: Decoration (ONLY Decoration vendors)
(7, 18, 'Bloom & Blossom Luxury Decors', 3, 'Custom floral mandaps, fairy-light canopies, eco-friendly luxury wedding stages, and thematic backdrops.', 6, '45 Koramangala 4th Block', 'Bangalore', 'Karnataka', '560034', NULL, NULL, 'Bangalore, Chennai, Hyderabad', 120000.00, '₹1,20,000 - ₹5,00,000', 4.88, 35, TRUE),
(8, 19, 'Mayura Traditional & Floral Mandaps', 3, 'Authentic South Indian temple-style wood carved pillars, brass vilakku styling, banana fiber drapes, and lotus ponds.', 14, '28 Malleshwaram 11th Cross', 'Bangalore', 'Karnataka', '560003', NULL, NULL, 'Bangalore', 95000.00, '₹95,000 - ₹3,50,000', 4.82, 38, TRUE),
(9, 20, 'Celestial Themes & Crystal Backdrops', 3, 'Enchanted forest aesthetics, acrylic geometric arches, mirror walkways, moving ambient lighting, and floral chandeliers.', 8, '88 HSR Layout Sector 4', 'Bangalore', 'Karnataka', '560102', NULL, NULL, 'Bangalore, Goa', 150000.00, '₹1,50,000 - ₹6,50,000', 4.91, 56, TRUE),

-- Category 4: Photography (ONLY Photography vendors)
(10, 21, 'Shutter & Soul Studios', 4, 'Award-winning candid wedding photography, drone cinematography, and heirloom albums.', 8, '12 Indiranagar 100ft Road', 'Bangalore', 'Karnataka', '560038', NULL, NULL, 'Bangalore, Mysore, Goa, Udaipur', 75000.00, '₹75,000 - ₹2,50,000', 4.95, 48, TRUE),
(11, 22, 'Candid Canvas Wedding Photography', 4, 'Unscripted emotive storytelling, documentary style ceremonies, vibrant pre-wedding shoots, and magazine photobooks.', 7, '34 Lavelle Road', 'Bangalore', 'Karnataka', '560001', NULL, NULL, 'Bangalore, Kochi', 65000.00, '₹65,000 - ₹2,00,000', 4.89, 39, TRUE),
(12, 23, 'Light & Shadows Visual Stories', 4, 'Cinematic couple portraits, dramatic twilight lighting, medium format cameras, and same-day highlights reel.', 11, '15 Richmond Road', 'Bangalore', 'Karnataka', '560025', NULL, NULL, 'Bangalore, Mumbai', 85000.00, '₹85,000 - ₹3,00,000', 4.92, 53, TRUE),

-- Category 5: Videography (ONLY Videography vendors)
(13, 24, 'Cinematic Vows 4K Filmworks', 5, 'Mastery in color graded 4K HDR wedding feature films, vows recordings, drone master shots, and cinema teaser edits.', 9, '52 JP Nagar 2nd Phase', 'Bangalore', 'Karnataka', '560078', NULL, NULL, 'Bangalore, Udaipur', 90000.00, '₹90,000 - ₹3,20,000', 4.93, 44, TRUE),
(14, 25, 'Aura Motion Wedding Teasers & Drone', 5, 'Specialized in 60-second viral Instagram reels, aerial drone mapping, multi-camera live streaming, and audio design.', 6, '72 Whitefield Main Road', 'Bangalore', 'Karnataka', '560066', NULL, NULL, 'Bangalore, Hyderabad', 70000.00, '₹70,000 - ₹2,10,000', 4.86, 31, TRUE),
(15, 26, 'Heirloom Reel Cinema Productions', 5, 'Nostalgic Super 8mm and cutting-edge cinema cameras combined to capture timeless family memoirs and emotional vows.', 12, '10 Cunningham Crescent', 'Bangalore', 'Karnataka', '560052', NULL, NULL, 'Bangalore, Delhi', 110000.00, '₹1,10,000 - ₹4,00,000', 4.96, 61, TRUE),

-- Category 6: Makeup (ONLY Makeup vendors)
(16, 27, 'Glamour Studio by Kavita', 6, 'Celebrity bridal makeover specialist, certified in HD Airbrush makeup, hair extensions, and bridal draping.', 7, '22 Lavelle Road', 'Bangalore', 'Karnataka', '560001', NULL, NULL, 'Bangalore, Chennai, Coorg', 30000.00, '₹30,000 - ₹85,000', 4.90, 42, TRUE),
(17, 28, 'Radiance HD Airbrush Artistry', 6, 'Waterproof sweat-resistant airbrush foundation, dramatic smokey eyes, glass-skin finish, and customized lash styling.', 9, '18 Brigade Road', 'Bangalore', 'Karnataka', '560001', NULL, NULL, 'Bangalore, Mysore', 28000.00, '₹28,000 - ₹75,000', 4.87, 36, TRUE),
(18, 29, 'Bella Bridal Makeovers', 6, 'Luxury organic cosmetics, traditional South Indian flower plait hairstyles, veil styling, and mother-of-the-bride packages.', 10, '67 Sadashivnagar', 'Bangalore', 'Karnataka', '560080', NULL, NULL, 'Bangalore', 35000.00, '₹35,000 - ₹95,000', 4.93, 58, TRUE),

-- Category 7: Mehendi (ONLY Mehendi vendors)
(19, 30, 'Henna Harmony Mehendi Art', 7, 'Exquisite organic henna designs, intricate bridal portrait mehendi, and fast modern party henna application.', 9, '14 Commercial Street', 'Bangalore', 'Karnataka', '560042', NULL, NULL, 'Bangalore, Hyderabad', 15000.00, '₹15,000 - ₹45,000', 4.82, 38, TRUE),
(20, 31, 'Rajasthani Royal Henna Creations', 7, 'Traditional Marwari royal figures, Radha-Krishna motifs, shehnai and baraat depictions up to elbows and knees.', 13, '81 Chickpet Main Road', 'Bangalore', 'Karnataka', '560053', NULL, NULL, 'Bangalore, Jaipur', 18000.00, '₹18,000 - ₹50,000', 4.91, 62, TRUE),
(21, 32, 'Marigold Bridal Mehendi Designers', 7, 'Minimalist Arabic floral lace, delicate mandala cuffs, personalized couple initials, and 100% natural chemical-free henna.', 8, '39 Jayanagar 4th Block', 'Bangalore', 'Karnataka', '560011', NULL, NULL, 'Bangalore', 14000.00, '₹14,000 - ₹38,000', 4.85, 29, TRUE),

-- Category 8: Bridal Wear (ONLY Bridal Wear vendors)
(22, 33, 'Varma Heritage Bridal Couture', 8, 'Handcrafted bridal silk lehengas, pure zari Kanjeevarams, and coordinated royal sherwani collections.', 14, '5 MG Road Arcade', 'Bangalore', 'Karnataka', '560001', NULL, NULL, 'Bangalore, Mumbai, Delhi', 85000.00, '₹85,000 - ₹3,50,000', 4.87, 40, TRUE),
(23, 34, 'Kanchipuram Silk Palace Bridal Zari', 8, 'Handwoven pure mulberry silk sarees with certified gold bullion zari borders, temple motifs, and bespoke stitched blouses.', 25, '103 Commercial Street', 'Bangalore', 'Karnataka', '560001', NULL, NULL, 'Bangalore, Chennai', 65000.00, '₹65,000 - ₹2,80,000', 4.94, 76, TRUE),
(24, 35, 'Aanya Designer Lehengas & Gowns', 8, 'Bespoke pastel organza lehengas, Swarovski encrusted reception ballgowns, and customized veil monogramming.', 6, '56 Indiranagar 12th Main', 'Bangalore', 'Karnataka', '560038', NULL, NULL, 'Bangalore', 95000.00, '₹95,000 - ₹4,20,000', 4.89, 34, TRUE),

-- Category 9: Groom Wear (ONLY Groom Wear vendors)
(25, 36, 'Imperial Sherwani & Bandhgala House', 9, 'Raw silk royal sherwanis, zardozi embroidered bandhgalas, matching safas, and custom carved ceremonial swords.', 12, '16 Commercial Street', 'Bangalore', 'Karnataka', '560001', NULL, NULL, 'Bangalore, Hyderabad', 45000.00, '₹45,000 - ₹1,80,000', 4.86, 33, TRUE),
(26, 37, 'The Royal Safa & Tuxedo Studio', 9, 'Bespoke three-piece Italian wool tuxedos, velvet dinner jackets, hand-tied Banarasi pagdis, and matching stoles.', 9, '88 Brigade Road', 'Bangalore', 'Karnataka', '560025', NULL, NULL, 'Bangalore', 38000.00, '₹38,000 - ₹1,40,000', 4.83, 27, TRUE),
(27, 38, 'Maharaja Bespoke Menswear', 9, 'Heritage royal court styling, achkans, embroidered juttis, pearl neckpieces, and custom cufflinks.', 15, '42 MG Road', 'Bangalore', 'Karnataka', '560001', NULL, NULL, 'Bangalore, Mumbai', 55000.00, '₹55,000 - ₹2,20,000', 4.91, 48, TRUE),

-- Category 10: Invitation (ONLY Invitation vendors)
(28, 39, 'Royal Scroll & Box Wedding Cards', 10, 'Velvet boxed invitations with brass monogram plates, silver scroll rollers, dry fruit compartments, and wax seals.', 16, '71 Avenue Road', 'Bangalore', 'Karnataka', '560002', NULL, NULL, 'Bangalore, Pan-India', 120.00, '₹120 - ₹850 per box', 4.84, 55, TRUE),
(29, 40, 'Paper & Gold Couture E-Invites', 10, 'Custom animated 3D video wedding invitations, interactive RSVP web portals, digital itineraries, and matching WhatsApp cards.', 5, '23 Koramangala 5th Block', 'Bangalore', 'Karnataka', '560095', NULL, NULL, 'Worldwide', 15000.00, '₹15,000 - ₹45,000', 4.92, 42, TRUE),
(30, 41, 'Heritage Engraved Letterpress Invites', 10, 'Cotton handmade deckle edge stationery, copper foil stamping, botanical watercolor envelope liners, and calligraphy addressing.', 11, '19 Richmond Town', 'Bangalore', 'Karnataka', '560025', NULL, NULL, 'Bangalore', 180.00, '₹180 - ₹600 per card', 4.88, 37, TRUE),

-- Category 11: Jewellery (ONLY Jewellery vendors)
(31, 42, 'Alankar Heritage Gold & Diamond Jewellers', 11, 'Certified 22K temple gold chokers, uncut diamond polki rani haars, matching maang tikkas, and jhumkas for royal brides.', 30, '50 Commercial Street', 'Bangalore', 'Karnataka', '560001', NULL, NULL, 'Bangalore', 150000.00, '₹1,50,000 - ₹12,00,000', 4.96, 92, TRUE),
(32, 43, 'Shringar Temple & Kundan Bridal Sets', 11, 'High-grade gold plated silver bridal jewelry on rental and purchase, handcrafted guttapusalu, and waist belts (vaddanam).', 14, '62 Malleshwaram 7th Cross', 'Bangalore', 'Karnataka', '560003', NULL, NULL, 'Bangalore, Mysore', 75000.00, '₹75,000 - ₹3,50,000', 4.90, 68, TRUE),
(33, 44, 'Navratna Antique Polki & Jadau Jewels', 11, 'Bespoke Nizam and Rajasthani Jadau heirlooms, real Basra pearls, Zambian emerald accents, and precious gemstone bangles.', 18, '10 Vittal Mallya Road', 'Bangalore', 'Karnataka', '560001', NULL, NULL, 'Bangalore, Mumbai', 120000.00, '₹1,20,000 - ₹8,00,000', 4.93, 51, TRUE),

-- Category 12: Wedding Cakes (ONLY Wedding Cake vendors)
(34, 45, 'Sweet Tier Gourmet Artisan Cakes', 12, 'Five-tier sculpted wedding cakes, handcrafted sugar orchids, Belgian chocolate ganache, and Madagascar vanilla bean tiers.', 8, '84 Defence Colony, Indiranagar', 'Bangalore', 'Karnataka', '560038', NULL, NULL, 'Bangalore', 8500.00, '₹8,500 - ₹45,000', 4.89, 43, TRUE),
(35, 46, 'Velvet Crust Luxury Wedding Confectionery', 12, 'Grand structural floral cakes, suspended chandelier cakes, metallic gold leaf finishes, and custom flavor tastings.', 10, '31 Lavelle Road', 'Bangalore', 'Karnataka', '560001', NULL, NULL, 'Bangalore', 12000.00, '₹12,000 - ₹65,000', 4.94, 57, TRUE),
(36, 47, 'Sugar Blossom Custom Fondant & Desserts', 12, 'French macaron towers, personalized cupcake tiers, eggless gourmet options, and dessert dessert bar spreads.', 6, '15 Koramangala 1st Block', 'Bangalore', 'Karnataka', '560034', NULL, NULL, 'Bangalore', 9500.00, '₹9,500 - ₹35,000', 4.86, 32, TRUE),

-- Category 13: Music & DJ (ONLY Music & DJ vendors)
(37, 48, 'Pulse & Beats Sound and DJ', 13, 'State-of-the-art Line Array sound systems, intelligent beam lighting, cold pyros, and Bollywood-EDM dance masters.', 6, '77 HSR Layout Sector 2', 'Bangalore', 'Karnataka', '560102', NULL, NULL, 'Bangalore, Goa, Kochi', 45000.00, '₹45,000 - ₹1,20,000', 4.79, 29, TRUE),
(38, 49, 'Swara Symphony Fusion Ensemble', 13, 'Classical nadhaswaram, violin maestros, flute fusion, and acoustic Sufi instrumental music for serene ceremonies.', 10, '31 Malleshwaram 8th Cross', 'Bangalore', 'Karnataka', '560003', NULL, NULL, 'Bangalore, Chennai, Coimbatore', 40000.00, '₹40,000 - ₹1,10,000', 4.91, 24, TRUE),
(39, 50, 'SoundWave LED Truss & DJ Arena', 13, 'P3 LED interactive video walls, concert-grade trussing, haze generators, sparkular machines, and celebrity DJ line-ups.', 8, '45 Whitefield Main Road', 'Bangalore', 'Karnataka', '560066', NULL, NULL, 'Bangalore', 55000.00, '₹55,000 - ₹1,60,000', 4.88, 39, TRUE),

-- Category 14: Transportation (ONLY Transportation vendors)
(40, 51, 'Royal Wheels Luxury Wedding Drives', 14, 'Immaculate vintage cars, stretch limousines, Mercedes S-Class bridal convoys, and AC tourist coaches for guests.', 8, '10 Outer Ring Road, Bellandur', 'Bangalore', 'Karnataka', '560103', NULL, NULL, 'Bangalore, Mysore', 25000.00, '₹25,000 - ₹90,000', 4.86, 31, TRUE),
(41, 52, 'Classic Vintage Convertibles & Baarat Motors', 14, '1938 open-top convertible tourers, Jaguar wedding sedans, royal horse carriage styling, and uniformed chauffeurs.', 12, '14 Palace Grounds Outer Gate', 'Bangalore', 'Karnataka', '560006', NULL, NULL, 'Bangalore', 35000.00, '₹35,000 - ₹1,20,000', 4.92, 45, TRUE),
(42, 53, 'Grand Luxury Sedans & Coaches', 14, 'Fleet of premium BMW and Mercedes bridal cars, 45-seater luxury AC Volvo coaches for airport guest shuttles.', 11, '88 Hosur Road, Electronic City', 'Bangalore', 'Karnataka', '560100', NULL, NULL, 'Bangalore', 20000.00, '₹20,000 - ₹80,000', 4.81, 38, TRUE),

-- Category 15: Florists (ONLY Florist vendors)
(43, 54, 'Petals & Stems Exotic Floral Stylists', 15, 'Directly imported Dutch tulips, Ecuadorian roses, delicate baby breath clouds, and bespoke bridal hand bouquets.', 7, '21 St. Marks Road', 'Bangalore', 'Karnataka', '560001', NULL, NULL, 'Bangalore', 45000.00, '₹45,000 - ₹1,50,000', 4.88, 36, TRUE),
(44, 55, 'Gardenia Fresh Orchid & Rose Mandaps', 15, 'Maduve flower arches, carnation tassels, scented tuberose garlands, floral car decor, and pooja flower baskets.', 15, '94 KR Market Floral Hub', 'Bangalore', 'Karnataka', '560002', NULL, NULL, 'Bangalore, Tumkur', 60000.00, '₹60,000 - ₹2,00,000', 4.93, 52, TRUE),
(45, 56, 'Vedic Fragrance Traditional Jasmine Florals', 15, 'Pure Madurai malli jasmine garlands, traditional rose petal showers, floral jewellery for Haldi, and stage borders.', 18, '33 Basavanagudi Bull Temple Road', 'Bangalore', 'Karnataka', '560004', NULL, NULL, 'Bangalore', 35000.00, '₹35,000 - ₹1,10,000', 4.87, 41, TRUE)
ON DUPLICATE KEY UPDATE 
  `business_name` = VALUES(`business_name`),
  `category_id` = VALUES(`category_id`),
  `description` = VALUES(`description`),
  `base_price` = VALUES(`base_price`),
  `price_range` = VALUES(`price_range`),
  `rating` = VALUES(`rating`),
  `latitude` = VALUES(`latitude`),
  `longitude` = VALUES(`longitude`),
  `is_verified` = TRUE;

-- 7. VENDOR SERVICES (Sample services for catalog items)
INSERT INTO `vendor_services` (`id`, `vendor_id`, `name`, `description`, `price`, `pricing_unit`) VALUES
(1, 1, 'Full Heritage Palace Ballroom & Lawn (1 Day)', 'Exclusive 24-hour access to Grand Hall, Dining Pavilion, 4 AC bridal green rooms', 450000.00, 'per_day'),
(2, 4, 'Royal 4-Course Banquet Feast (500 Pax)', 'Welcome mocktails, 4 live starter stations, 18 main dishes, 5 royal desserts', 425000.00, 'per_event'),
(3, 7, 'Grand Royal Palace Stage & Mandap Decor', 'Imported flower mandap, thematic stage lighting, entrance arch, and VIP dining settings', 220000.00, 'per_event'),
(4, 10, 'Signature 2-Day Candid & Cinematic Package', 'Full 2-day photo & 4K cinematic video, drone coverage, and 2 premium leather-bound albums', 140000.00, 'per_event'),
(5, 13, 'Cinematic 4K Wedding Film & Drone Reel', '4K cinematic film, drone highlights, 3-minute teaser, full multicam ceremony edit', 90000.00, 'per_event'),
(6, 16, 'Bridal Deluxe HD Airbrush & Hair Package', 'HD Airbrush makeup, luxury lash extensions, intricate floral hair styling, and draping', 35000.00, 'per_event'),
(7, 19, 'Royal Bridal Rajasthani & Arabic Mehendi', 'Elaborate figure mehendi up to elbows and knees, customized bridal story elements', 18000.00, 'per_event'),
(8, 22, 'Handwoven Royal Bridal Silk Lehenga', 'Custom designer zardozi and raw silk bridal lehenga with dual dupattas and veil', 120000.00, 'per_event'),
(9, 25, 'Imperial Raw Silk Sherwani & Stole', 'Hand embroidered royal sherwani with coordinating safa, stole, and juttis', 45000.00, 'per_event'),
(10, 28, 'Bespoke Boxed Invitation Collection (200 Units)', 'Velvet finish presentation box with metallic foil card, custom wax seal, and inserts', 55000.00, 'per_event'),
(11, 31, 'Royal Kundan & Uncut Polki Bridal Suite', 'Grand choker set, matching rani haar, maang tikka, earrings, and haathphool', 150000.00, 'per_event'),
(12, 34, '4-Tier Architectural Sugar Floral Wedding Cake', 'Belgian dark chocolate ganache, handcrafted sugar peonies, gold leaf accents (25kg)', 28000.00, 'per_event'),
(13, 37, 'Sangeet Party DJ, Truss & Laser Setup', 'Complete JBL line array, digital DJ console, intelligent moving heads, and smoke', 60000.00, 'per_event'),
(14, 40, '1947 Classic Vintage Car Rental (Bridal Entry)', 'Vintage open-top convertible for groom baarat or couple send-off with chauffeur', 35000.00, 'per_day'),
(15, 43, 'Exotic Imported Floral Mandap & Entry Walkway', 'Cascading white orchids, hydrangea pillars, and scented rose petal carpet', 85000.00, 'per_event')
ON DUPLICATE KEY UPDATE `price` = VALUES(`price`), `name` = VALUES(`name`);

-- 8. WEDDING PROJECTS (5 Projects matching the 5 Customers)
INSERT INTO `wedding_projects` (`id`, `project_code`, `customer_id`, `planner_id`, `title`, `wedding_date`, `venue_name`, `venue_address`, `city`, `guest_count`, `total_budget`, `status`, `notes`) VALUES
(1, 'WP-2026-001', 1, 1, 'Barani & Anita Royal Nuptials', '2026-11-20', 'The Grand Royal Palace', '88 Palace Cross Road', 'Bangalore', 450, 1500000.00, 'IN_PROGRESS', 'Core vendors arranged, advance paid, final decor review pending.'),
(2, 'WP-2026-002', 2, 1, 'Malini & Sneha Pastel Dream Wedding', '2026-12-05', 'Manpho Convention Centre & Royal Lawns', 'Nagavara Outer Ring Road', 'Bangalore', 350, 1200000.00, 'CONFIRMED', 'All bookings locked, advance and second payments completed.'),
(3, 'WP-2026-003', 3, 1, 'Loha & Pooja Traditional Muhurtham', '2026-12-18', 'ITC Windsor Heritage Ballroom', '25 Golf Course Road', 'Bangalore', 500, 1800000.00, 'PLANNING', 'Vendor requests in review, customer checking photography options.'),
(4, 'WP-2027-004', 4, 1, 'Ranjani & Meera Minimalist Celebration', '2027-01-15', 'The Grand Royal Palace', '88 Palace Cross Road', 'Bangalore', 300, 1100000.00, 'PLANNING', 'Customer requested change on catering vendor, planner re-assigning.'),
(5, 'WP-2027-005', 5, 1, 'Siva & Deepika Bollywood Extravaganza', '2027-02-10', 'Manpho Convention Centre & Royal Lawns', 'Nagavara Outer Ring Road', 'Bangalore', 600, 2200000.00, 'IN_PROGRESS', 'DJ, sound, and bridal couture vendor accepted.')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `status` = VALUES(`status`);

-- 9. WEDDING REQUIREMENTS
INSERT INTO `wedding_requirements` (`id`, `customer_id`, `wedding_project_id`, `wedding_date`, `location`, `guest_count`, `estimated_budget`, `required_services`, `special_preferences`, `status`) VALUES
(1, 1, 1, '2026-11-20', 'Bangalore', 450, 1500000.00, '["photography", "decoration", "wedding-hall", "catering", "makeup", "music-dj"]', 'Prefer royal gold and crimson theme with South Indian traditional breakfast and multi-cuisine reception.', 'CONVERTED_TO_PROJECT'),
(2, 2, 2, '2026-12-05', 'Bangalore', 350, 1200000.00, '["photography", "decoration", "catering", "mehendi", "music-dj"]', 'Pastel floral mandap with fairy lights and energetic evening DJ.', 'CONVERTED_TO_PROJECT'),
(3, 3, 3, '2026-12-18', 'Bangalore', 500, 1800000.00, '["wedding-hall", "photography", "decoration", "catering", "transportation"]', 'Traditional temple architecture style stage and live classical fusion music.', 'CONVERTED_TO_PROJECT'),
(4, 4, 4, '2027-01-15', 'Bangalore', 300, 1100000.00, '["catering", "photography", "decoration", "makeup"]', 'Strictly eco-friendly, zero-plastic wedding decor with local organic catering.', 'CONVERTED_TO_PROJECT'),
(5, 5, 5, '2027-02-10', 'Bangalore', 600, 2200000.00, '["wedding-hall", "music-dj", "photography", "bridal-wear", "decoration", "transportation"]', 'Grand Sangeet with concert-style lighting, LED wall, and luxury vintage car for baarat.', 'CONVERTED_TO_PROJECT')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- 10. VENDOR REQUESTS
INSERT INTO `vendor_requests` (`id`, `request_code`, `wedding_project_id`, `planner_id`, `vendor_id`, `service_id`, `event_date`, `start_time`, `end_time`, `proposed_price`, `notes`, `status`, `decline_reason`, `responded_at`) VALUES
(1, 'REQ-2026-001', 1, 1, 10, 4, '2026-11-20', '08:00:00', '22:00:00', 140000.00, '2-Day Candid & Cinematic Package for Barani & Anita', 'ACCEPTED', NULL, '2026-09-02 11:30:00'),
(2, 'REQ-2026-002', 1, 1, 7, 3, '2026-11-20', '06:00:00', '23:00:00', 220000.00, 'Grand Royal Palace Stage & Mandap Floral Decor', 'ACCEPTED', NULL, '2026-09-02 12:15:00'),
(3, 'REQ-2026-003', 1, 1, 1, 1, '2026-11-20', '06:00:00', '23:59:00', 450000.00, 'Full Heritage Palace Ballroom & Lawns', 'ACCEPTED', NULL, '2026-09-02 14:00:00'),
(4, 'REQ-2026-004', 1, 1, 16, 6, '2026-11-20', '05:00:00', '14:00:00', 35000.00, 'Bridal Deluxe HD Airbrush Makeup for Anita', 'ACCEPTED', NULL, '2026-09-02 15:20:00'),
(5, 'REQ-2026-005', 2, 1, 10, 4, '2026-12-05', '08:00:00', '22:00:00', 135000.00, 'Full day photography and cinematic teaser', 'ACCEPTED', NULL, '2026-09-05 10:00:00'),
(6, 'REQ-2026-006', 2, 1, 37, 13, '2026-12-05', '16:00:00', '23:30:00', 60000.00, 'Sangeet DJ and dynamic intelligent lighting', 'ACCEPTED', NULL, '2026-09-05 14:30:00'),
(7, 'REQ-2026-007', 3, 1, 10, 4, '2026-12-18', '08:00:00', '22:00:00', 140000.00, 'Checking if Vikram can cover South Indian temple wedding', 'PENDING', NULL, NULL),
(8, 'REQ-2026-008', 4, 1, 4, 2, '2027-01-15', '07:00:00', '22:00:00', 425000.00, 'Request for 300 pax traditional wedding lunch', 'DECLINED', 'Regretfully, central kitchen is undergoing scheduled renovation.', '2026-09-10 16:20:00')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- 11. BOOKINGS
INSERT INTO `bookings` (`id`, `booking_code`, `wedding_project_id`, `customer_id`, `planner_id`, `total_amount`, `advance_amount`, `paid_amount`, `status`, `customer_feedback`) VALUES
(1, 'BK-2026-001', 1, 1, 1, 845000.00, 250000.00, 550000.00, 'PARTIALLY_PAID', 'Vendor arrangements look majestic. Advance and 2nd payments transferred smoothly.'),
(2, 'BK-2026-002', 2, 2, 1, 260000.00, 80000.00, 260000.00, 'CONFIRMED', 'Completely satisfied with pastel theme vendors and DJ setup.')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- 12. BOOKING SERVICES
INSERT INTO `booking_services` (`id`, `booking_id`, `vendor_id`, `vendor_request_id`, `service_id`, `service_name`, `category_name`, `agreed_price`, `status`, `notes`) VALUES
(1, 1, 10, 1, 4, 'Signature 2-Day Candid & Cinematic Package', 'Photography', 140000.00, 'CONFIRMED', 'Includes pre-wedding drone reel'),
(2, 1, 7, 2, 3, 'Grand Royal Palace Stage & Mandap Decor', 'Decoration', 220000.00, 'CONFIRMED', 'Floral theme approved by customer'),
(3, 1, 1, 3, 1, 'Full Heritage Palace Ballroom & Lawn (1 Day)', 'Wedding Halls', 450000.00, 'CONFIRMED', 'Main banquet hall booked'),
(4, 1, 16, 4, 6, 'Bridal Deluxe HD Airbrush & Hair Package', 'Makeup', 35000.00, 'CONFIRMED', 'Airbrush makeup for morning muhurtham and evening reception'),
(5, 2, 10, 5, 4, 'Signature 2-Day Candid & Cinematic Package', 'Photography', 135000.00, 'CONFIRMED', 'Includes traditional album and candid highlights'),
(6, 2, 37, 6, 13, 'Sangeet Party DJ, Truss & Laser Setup', 'Music & DJ', 60000.00, 'CONFIRMED', 'High energy LED dance floor setup')
ON DUPLICATE KEY UPDATE `agreed_price` = VALUES(`agreed_price`);

-- 13. PAYMENTS
INSERT INTO `payments` (`id`, `payment_code`, `booking_id`, `wedding_project_id`, `customer_id`, `title`, `milestone_name`, `amount`, `due_date`, `status`) VALUES
(1, 'PAY-2026-001-A', 1, 1, 1, 'Wedding Advance Retainer', 'Advance', 250000.00, '2026-09-05', 'SUCCESS'),
(2, 'PAY-2026-001-B', 1, 1, 1, 'Second Milestone Payment (Vendor Lock-in)', 'Second Payment', 300000.00, '2026-10-05', 'SUCCESS'),
(3, 'PAY-2026-001-C', 1, 1, 1, 'Final Settlement Balance', 'Final Payment', 295000.00, '2026-11-15', 'PENDING'),
(4, 'PAY-2026-002-A', 2, 2, 2, 'Booking Advance', 'Advance', 80000.00, '2026-09-10', 'SUCCESS'),
(5, 'PAY-2026-002-B', 2, 2, 2, 'Second Installment', 'Second Payment', 100000.00, '2026-10-15', 'SUCCESS'),
(6, 'PAY-2026-002-C', 2, 2, 2, 'Final Wedding Settlement', 'Final Payment', 80000.00, '2026-11-25', 'SUCCESS')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- 14. INVOICES
INSERT INTO `invoices` (`id`, `invoice_number`, `booking_id`, `payment_id`, `issuer_id`, `recipient_id`, `subtotal`, `tax_amount`, `total_amount`, `status`, `due_date`, `pdf_url`) VALUES
(1, 'INV-2026-001', 1, 1, 6, 7, 250000.00, 0.00, 250000.00, 'PAID', '2026-09-05', '/uploads/invoices/INV-2026-001.pdf'),
(2, 'INV-2026-002', 1, 2, 6, 7, 300000.00, 0.00, 300000.00, 'PAID', '2026-10-05', '/uploads/invoices/INV-2026-002.pdf'),
(3, 'INV-2026-003', 1, 3, 6, 7, 295000.00, 0.00, 295000.00, 'ISSUED', '2026-11-15', '/uploads/invoices/INV-2026-003.pdf'),
(4, 'INV-2026-004', 2, 4, 6, 8, 80000.00, 0.00, 80000.00, 'PAID', '2026-09-10', '/uploads/invoices/INV-2026-004.pdf'),
(5, 'INV-2026-005', 2, 5, 6, 8, 100000.00, 0.00, 100000.00, 'PAID', '2026-10-15', '/uploads/invoices/INV-2026-005.pdf')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- 15. BUDGETS
INSERT INTO `budgets` (`id`, `wedding_project_id`, `total_budget`, `allocated_amount`, `spent_amount`, `remaining_amount`) VALUES
(1, 1, 1500000.00, 1250000.00, 550000.00, 250000.00),
(2, 2, 1200000.00, 1050000.00, 260000.00, 150000.00),
(3, 3, 1800000.00, 1400000.00, 0.00, 400000.00),
(4, 4, 1100000.00, 850000.00, 0.00, 250000.00),
(5, 5, 2200000.00, 1900000.00, 30000.00, 300000.00)
ON DUPLICATE KEY UPDATE `total_budget` = VALUES(`total_budget`);

-- 16. WEDDING SCHEDULE
INSERT INTO `wedding_schedule` (`id`, `wedding_project_id`, `event_title`, `event_date`, `start_time`, `end_time`, `location`, `description`, `person_in_charge`, `vendor_id`, `status`) VALUES
(1, 1, 'Bridal Makeup & Saree Draping', '2026-11-20', '05:30:00', '08:00:00', 'Suite 101, Grand Royal Palace', 'Bridal preparation with HD airbrush makeup', 'Kavita Menon', 16, 'SCHEDULED'),
(2, 1, 'Baraat & Groom Arrival Procession', '2026-11-20', '08:30:00', '09:30:00', 'Palace North Gate', 'Procession with dhol players and floral umbrella', 'Priya Sharma (Planner)', NULL, 'SCHEDULED'),
(3, 1, 'Sacred Muhurtham & Kanyadaan', '2026-11-20', '09:45:00', '11:45:00', 'Main Kalyana Mandapam', 'Vedic wedding ceremony rituals and mangalsutra tying', 'Priest Shastri Ji', 1, 'SCHEDULED'),
(4, 1, 'Traditional Banquet Lunch', '2026-11-20', '12:00:00', '15:00:00', 'Dining Pavilion', '32-item traditional feast on plantain leaves', 'Chef Rajesh Nair', 4, 'SCHEDULED'),
(5, 1, 'Grand Reception & Live Music', '2026-11-20', '18:30:00', '22:30:00', 'Main Ballroom', 'Cake cutting, couple stage meet, and live violin-flute fusion', 'Priya Sharma', 38, 'SCHEDULED')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- 17. NOTIFICATIONS
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `notification_type`, `reference_id`, `reference_type`, `is_read`) VALUES
(1, 6, 'New Wedding Requirement Submitted', 'Customer Barani submitted wedding requirements for November 2026.', 'SYSTEM', 1, 'requirement', TRUE),
(2, 21, 'New Booking Request Received', 'Planner Priya Sharma requested your Candid & Cinematic Package for Nov 20, 2026.', 'REQUEST_NEW', 1, 'vendor_request', TRUE),
(3, 6, 'Vendor Accepted Request', 'Vikram Rathore accepted booking request REQ-2026-001 for ₹1,40,000.', 'REQUEST_ACCEPTED', 1, 'vendor_request', TRUE),
(4, 7, 'Vendor Arrangement Ready for Approval', 'Planner Priya arranged photography, floral decor, and palace venue for your wedding.', 'CUSTOMER_APPROVAL', 1, 'booking', TRUE),
(5, 7, 'Advance Payment Received', 'Advance payment of ₹2,50,000 was successfully processed via UPI.', 'PAYMENT_SUCCESS', 1, 'payment', TRUE)
ON DUPLICATE KEY UPDATE `is_read` = VALUES(`is_read`);

-- 18. CONVERSATIONS & MESSAGES
INSERT INTO `conversations` (`id`, `wedding_project_id`, `participant_one_id`, `participant_two_id`, `last_message_at`) VALUES
(1, 1, 6, 7, '2026-09-18 15:40:00'),
(2, 1, 6, 21, '2026-09-18 16:10:00')
ON DUPLICATE KEY UPDATE `last_message_at` = VALUES(`last_message_at`);

INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `recipient_id`, `message_text`, `is_read`, `read_at`) VALUES
(1, 1, 7, 6, 'Hi Priya, we reviewed the photography portfolio for Vikram. The candid portraits are spectacular!', TRUE, '2026-09-18 14:00:00'),
(2, 1, 6, 7, 'Thank you Barani! Vikram has reserved your dates for November 20th.', TRUE, '2026-09-18 14:15:00'),
(3, 2, 6, 21, 'Hi Vikram, Barani & Anita have officially approved your package. Please lock Nov 20 in your calendar.', TRUE, '2026-09-18 16:00:00')
ON DUPLICATE KEY UPDATE `is_read` = VALUES(`is_read`);
