-- =====================================================================
-- Wedding Planner and Vendor Coordination Platform (WPVCP)
-- Production Seed / Sample Data
-- All user passwords are: password123
-- =====================================================================

USE `wedding_planner`;

-- 1. ROLES
INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'PLANNER', 'Platform administrator and wedding coordinator'),
(2, 'VENDOR', 'Service provider accepting planner requests and bookings'),
(3, 'CUSTOMER', 'Couple submitting requirements and approving arrangements')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- 2. SERVICE CATEGORIES (16 database-driven categories)
INSERT INTO `service_categories` (`id`, `name`, `slug`, `description`, `icon`) VALUES
(1, 'Wedding Hall', 'wedding-hall', 'Luxury convention centers, heritage palaces, and open-air lawns', 'Building2'),
(2, 'Catering', 'catering', 'Gourmet vegetarian and multi-cuisine culinary banquets', 'Utensils'),
(3, 'Decoration', 'decoration', 'Floral stages, theme mandates, entrance gates, and lighting', 'Palette'),
(4, 'Photography', 'photography', 'Candid, traditional portraits, drone coverage, and photobooks', 'Camera'),
(5, 'Videography', 'videography', 'Cinematic 4K wedding films, teasers, and livestreaming', 'Video'),
(6, 'Mehendi', 'mehendi', 'Intricate bridal henna, Rajasthani, and Arabic mehendi artistry', 'Sparkles'),
(7, 'Makeup', 'makeup', 'Bridal makeover, HD airbrush makeup, and hair styling', 'Heart'),
(8, 'DJ', 'dj', 'High-energy sound systems, LED dance floors, and top DJ mixes', 'Disc'),
(9, 'Music', 'music', 'Live classical instrumentalists, shehnai, and fusion bands', 'Music'),
(10, 'Bridal Wear', 'bridal-wear', 'Designer bridal lehengas, Kanjeevaram sarees, and gowns', 'Crown'),
(11, 'Groom Wear', 'groom-wear', 'Bespoke sherwanis, bandhgalas, tuxedos, and safas', 'Shirt'),
(12, 'Invitation', 'invitation', 'Custom engraved physical invites, e-invites, and wax seals', 'Mail'),
(13, 'Flower Decoration', 'flower-decoration', 'Exotic imported blooms, mandap florals, and car decoration', 'Flower2'),
(14, 'Transportation', 'transportation', 'Vintage convertibles, luxury sedans, and guest coaches', 'Car'),
(15, 'Wedding Cake', 'wedding-cake', 'Multi-tiered designer wedding cakes and dessert counters', 'Cake'),
(16, 'Entertainment', 'entertainment', 'Celebrity performers, anchors, folk troupes, and fireworks', 'PartyPopper')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Common bcrypt hash for 'password123':
-- $2a$10$N8HuJlfug161k.CXFad/Uu/7Avyyg2xdLYnvwz1UHaXDmuI.STyTi

-- 3. USERS (2 Planners + 10 Vendors + 10 Customers = 22 Users)
INSERT INTO `users` (`id`, `email`, `password_hash`, `role_id`, `full_name`, `phone`, `auth_provider`, `email_verified`, `is_active`) VALUES
-- Planners (IDs 1-2)
(1, 'planner@wedding.com', '$2a$10$N8HuJlfug161k.CXFad/Uu/7Avyyg2xdLYnvwz1UHaXDmuI.STyTi', 1, 'Priya Sharma', '+91 98765 43210', 'local', TRUE, TRUE),
(2, 'arjun.planner@wedding.com', '$2a$10$N8HuJlfug161k.CXFad/Uu/7Avyyg2xdLYnvwz1UHaXDmuI.STyTi', 1, 'Arjun Kapoor', '+91 98765 43211', 'local', TRUE, TRUE),

-- Vendors (IDs 3-12)
(3, 'shutter@wedding.com', '$2a$10$N8HuJlfug161k.CXFad/Uu/7Avyyg2xdLYnvwz1UHaXDmuI.STyTi', 2, 'Vikram Rathore', '+91 98450 11001', 'local', TRUE, TRUE),
(4, 'floral@wedding.com', '$2a$10$N8HuJlfug161k.CXFad/Uu/7Avyyg2xdLYnvwz1UHaXDmuI.STyTi', 2, 'Ananya Roy', '+91 98450 11002', 'local', TRUE, TRUE),
(5, 'grandpalace@wedding.com', '$2a$10$N8HuJlfug161k.CXFad/Uu/7Avyyg2xdLYnvwz1UHaXDmuI.STyTi', 2, 'Sanjay Singhania', '+91 98450 11003', 'local', TRUE, TRUE),
(6, 'royalcatering@wedding.com', '$2a$10$N8HuJlfug161k.CXFad/Uu/7Avyyg2xdLYnvwz1UHaXDmuI.STyTi', 2, 'Chef Rajesh Nair', '+91 98450 11004', 'local', TRUE, TRUE),
(7, 'glamour@wedding.com', '$2a$10$N8HuJlfug161k.CXFad/Uu/7Avyyg2xdLYnvwz1UHaXDmuI.STyTi', 2, 'Kavita Menon', '+91 98450 11005', 'local', TRUE, TRUE),
(8, 'henna@wedding.com', '$2a$10$N8HuJlfug161k.CXFad/Uu/7Avyyg2xdLYnvwz1UHaXDmuI.STyTi', 2, 'Fatima Sheikh', '+91 98450 11006', 'local', TRUE, TRUE),
(9, 'djbeats@wedding.com', '$2a$10$N8HuJlfug161k.CXFad/Uu/7Avyyg2xdLYnvwz1UHaXDmuI.STyTi', 2, 'DJ Rohit Roy', '+91 98450 11007', 'local', TRUE, TRUE),
(10, 'symphony@wedding.com', '$2a$10$N8HuJlfug161k.CXFad/Uu/7Avyyg2xdLYnvwz1UHaXDmuI.STyTi', 2, 'Mahesh Iyer', '+91 98450 11008', 'local', TRUE, TRUE),
(11, 'royalcouture@wedding.com', '$2a$10$N8HuJlfug161k.CXFad/Uu/7Avyyg2xdLYnvwz1UHaXDmuI.STyTi', 2, 'Sunita Varma', '+91 98450 11009', 'local', TRUE, TRUE),
(12, 'royalcars@wedding.com', '$2a$10$N8HuJlfug161k.CXFad/Uu/7Avyyg2xdLYnvwz1UHaXDmuI.STyTi', 2, 'Karthik Reddy', '+91 98450 11010', 'local', TRUE, TRUE),

-- Customers (IDs 13-22)
(13, 'rahul.anita@gmail.com', '$2a$10$N8HuJlfug161k.CXFad/Uu/7Avyyg2xdLYnvwz1UHaXDmuI.STyTi', 3, 'Rahul Verma', '+91 91234 56701', 'local', TRUE, TRUE),
(14, 'rohit.sneha@gmail.com', '$2a$10$N8HuJlfug161k.CXFad/Uu/7Avyyg2xdLYnvwz1UHaXDmuI.STyTi', 3, 'Rohit Kulkarni', '+91 91234 56702', 'local', TRUE, TRUE),
(15, 'siddharth.pooja@gmail.com', '$2a$10$N8HuJlfug161k.CXFad/Uu/7Avyyg2xdLYnvwz1UHaXDmuI.STyTi', 3, 'Siddharth Hegde', '+91 91234 56703', 'local', TRUE, TRUE),
(16, 'aditya.meera@gmail.com', '$2a$10$N8HuJlfug161k.CXFad/Uu/7Avyyg2xdLYnvwz1UHaXDmuI.STyTi', 3, 'Aditya Nambiar', '+91 91234 56704', 'local', TRUE, TRUE),
(17, 'karthik.deepika@gmail.com', '$2a$10$N8HuJlfug161k.CXFad/Uu/7Avyyg2xdLYnvwz1UHaXDmuI.STyTi', 3, 'Karthik Sundaram', '+91 91234 56705', 'local', TRUE, TRUE),
(18, 'varun.ria@gmail.com', '$2a$10$N8HuJlfug161k.CXFad/Uu/7Avyyg2xdLYnvwz1UHaXDmuI.STyTi', 3, 'Varun Deshmukh', '+91 91234 56706', 'local', TRUE, TRUE),
(19, 'abhishek.tanvi@gmail.com', '$2a$10$N8HuJlfug161k.CXFad/Uu/7Avyyg2xdLYnvwz1UHaXDmuI.STyTi', 3, 'Abhishek Joshi', '+91 91234 56707', 'local', TRUE, TRUE),
(20, 'manoj.divya@gmail.com', '$2a$10$N8HuJlfug161k.CXFad/Uu/7Avyyg2xdLYnvwz1UHaXDmuI.STyTi', 3, 'Manoj Pillai', '+91 91234 56708', 'local', TRUE, TRUE),
(21, 'naveen.bhavana@gmail.com', '$2a$10$N8HuJlfug161k.CXFad/Uu/7Avyyg2xdLYnvwz1UHaXDmuI.STyTi', 3, 'Naveen Reddy', '+91 91234 56709', 'local', TRUE, TRUE),
(22, 'gautam.ishita@gmail.com', '$2a$10$N8HuJlfug161k.CXFad/Uu/7Avyyg2xdLYnvwz1UHaXDmuI.STyTi', 3, 'Gautam Sen', '+91 91234 56710', 'local', TRUE, TRUE)
ON DUPLICATE KEY UPDATE `email_verified` = VALUES(`email_verified`);

-- 4. PLANNERS
INSERT INTO `planners` (`id`, `user_id`, `agency_name`, `bio`, `experience_years`, `contact_phone`) VALUES
(1, 1, 'Vows & Veils Signature Weddings', 'Lead destination wedding architect with over 10 years curating bespoke royal celebrations across South Asia.', 10, '+91 98765 43210'),
(2, 2, 'The Grand Affair Planners', 'Specializing in contemporary fusion weddings, meticulous budget management, and high-tech vendor logistics.', 7, '+91 98765 43211')
ON DUPLICATE KEY UPDATE `agency_name` = VALUES(`agency_name`);

-- 5. VENDORS (10 realistic vendors)
INSERT INTO `vendors` (`id`, `user_id`, `business_name`, `category_id`, `description`, `experience_years`, `address`, `city`, `state`, `postal_code`, `service_locations`, `base_price`, `price_range`, `rating`, `total_reviews`, `is_verified`) VALUES
(1, 3, 'Shutter & Soul Studios', 4, 'Award-winning candid wedding photography, drone cinematography, and heirloom albums.', 8, '12 Indiranagar 100ft Road', 'Bangalore', 'Karnataka', '560038', 'Bangalore, Mysore, Goa, Udaipur', 75000.00, '₹75,000 - ₹2,50,000', 4.95, 48, TRUE),
(2, 4, 'Bloom & Blossom Luxury Decors', 3, 'Custom floral mandaps, fairy-light canopies, eco-friendly luxury wedding stages, and thematic backdrops.', 6, '45 Koramangala 4th Block', 'Bangalore', 'Karnataka', '560034', 'Bangalore, Chennai, Hyderabad', 120000.00, '₹1,20,000 - ₹5,00,000', 4.88, 35, TRUE),
(3, 5, 'The Grand Royal Palace & Convention', 1, 'Palatial heritage venue featuring 2500-capacity pillarless banquet halls, lush manicured lawns, and deluxe bridal suites.', 15, '88 Palace Cross Road', 'Bangalore', 'Karnataka', '560020', 'Bangalore', 350000.00, '₹3,50,000 - ₹12,00,000', 4.92, 64, TRUE),
(4, 6, 'Royal Feast Gourmet Caterers', 2, 'Authentic multi-course feasts spanning South Indian traditional plantain leaf, North Indian royal cuisine, and live continental counters.', 12, '19 Jayanagar 7th Block', 'Bangalore', 'Karnataka', '560070', 'Bangalore, Mysore', 650.00, '₹650 - ₹1,800 per plate', 4.85, 52, TRUE),
(5, 7, 'Glamour Studio by Kavita', 7, 'Celebrity bridal makeover specialist, certified in HD Airbrush makeup, hair extensions, and bridal draping.', 7, '22 Lavelle Road', 'Bangalore', 'Karnataka', '560001', 'Bangalore, Chennai, Coorg', 30000.00, '₹30,000 - ₹85,000', 4.90, 42, TRUE),
(6, 8, 'Henna Harmony Mehendi Art', 6, 'Exquisite organic henna designs, intricate bridal portrait mehendi, and fast modern party henna application.', 9, '14 Commercial Street', 'Bangalore', 'Karnataka', '560042', 'Bangalore, Hyderabad', 15000.00, '₹15,000 - ₹45,000', 4.82, 38, TRUE),
(7, 9, 'Pulse & Beats Sound and DJ', 8, 'State-of-the-art Line Array sound systems, intelligent beam lighting, cold pyros, and Bollywood-EDM dance masters.', 6, '77 HSR Layout Sector 2', 'Bangalore', 'Karnataka', '560102', 'Bangalore, Goa, Kochi', 45000.00, '₹45,000 - ₹1,20,000', 4.79, 29, TRUE),
(8, 10, 'Swara Symphony Fusion Ensemble', 9, 'Classical nadhaswaram, violin maestros, flute fusion, and acoustic Sufi instrumental music for serene ceremonies.', 10, '31 Malleshwaram 8th Cross', 'Bangalore', 'Karnataka', '560003', 'Bangalore, Chennai, Coimbatore', 40000.00, '₹40,000 - ₹1,10,000', 4.91, 24, TRUE),
(9, 11, 'Varma Heritage Bridal Couture', 10, 'Handcrafted bridal silk lehengas, pure zari Kanjeevarams, and coordinated royal sherwani collections.', 14, '5 MG Road Arcade', 'Bangalore', 'Karnataka', '560001', 'Bangalore, Mumbai, Delhi', 85000.00, '₹85,000 - ₹3,50,000', 4.87, 40, TRUE),
(10, 12, 'Royal Wheels Luxury Wedding Drives', 14, 'Immaculate vintage cars, stretch limousines, Mercedes S-Class bridal convoys, and AC tourist coaches for guests.', 8, '10 Outer Ring Road, Bellandur', 'Bangalore', 'Karnataka', '560103', 'Bangalore, Mysore', 25000.00, '₹25,000 - ₹90,000', 4.86, 31, TRUE)
ON DUPLICATE KEY UPDATE `business_name` = VALUES(`business_name`);

-- 6. VENDOR SERVICES (Catalog items)
INSERT INTO `vendor_services` (`id`, `vendor_id`, `name`, `description`, `price`, `pricing_unit`) VALUES
(1, 1, 'Signature 2-Day Candid & Cinematic Package', 'Full 2-day photo & 4K cinematic video, drone coverage, and 2 premium leather-bound albums', 140000.00, 'per_event'),
(2, 1, 'Pre-Wedding Conceptual Shoot', '1-day outdoor shoot with 3 outfit changes, 40 retouched high-res photos, and 3-minute teaser film', 45000.00, 'per_event'),
(3, 2, 'Grand Royal Palace Stage & Mandap Decor', 'Imported flower mandap, thematic stage lighting, entrance arch, and VIP dining floral settings', 220000.00, 'per_event'),
(4, 2, 'Haldi & Mehendi Vibrant Bohemian Setup', 'Marigold curtains, bohemian jhoola canopy, quirky photo booths, and floor cushions', 65000.00, 'per_event'),
(5, 3, 'Full Heritage Palace Ballroom & Lawn (1 Day)', 'Exclusive 24-hour access to Grand Hall, Dining Pavilion, 4 Air-conditioned bridal green rooms', 450000.00, 'per_day'),
(6, 4, 'Royal 4-Course Banquet Feast (500 Pax)', 'Welcome mocktails, 4 live starter stations, 18 main dishes, 5 royal desserts, and mineral water', 425000.00, 'per_event'),
(7, 5, 'Bridal Deluxe HD Airbrush & Hair Package', 'HD Airbrush makeup, luxury lash extensions, intricate floral hair styling, and saree/lehenga draping', 35000.00, 'per_event'),
(8, 6, 'Royal Bridal Rajasthani & Arabic Mehendi', 'Elaborate figure mehendi up to elbows and knees, customized bridal story elements', 18000.00, 'per_event'),
(9, 7, 'Sangeet Party DJ, Truss & Laser Setup', 'Complete JBL sound system, digital DJ console, intelligent moving heads, smoke machine, and sparklers', 60000.00, 'per_event'),
(10, 8, 'Live Classical Fusion Band for Muhurtham', '4-piece Carnatic & Western acoustic fusion ensemble (Violin, Flute, Mridangam, Keyboard)', 45000.00, 'per_event'),
(11, 9, 'Handwoven Royal Bridal Silk Lehenga', 'Custom designer zardozi and raw silk bridal lehenga with dual dupattas and veil', 120000.00, 'per_event'),
(12, 10, '1947 Classic Vintage Car Rental (Bridal Entry)', 'Vintage open-top convertible for groom baarat or couple send-off with professional chauffeur', 35000.00, 'per_day')
ON DUPLICATE KEY UPDATE `price` = VALUES(`price`);

-- 7. CUSTOMERS (10 realistic couples assigned to Planner 1 or Planner 2)
INSERT INTO `customers` (`id`, `user_id`, `partner_name`, `wedding_date`, `city`, `state`, `address`, `wedding_theme`, `guest_count`, `estimated_budget`, `planner_id`) VALUES
(1, 13, 'Anita Verma', '2026-11-20', 'Bangalore', 'Karnataka', '74 Sadashivnagar', 'Royal Heritage & Florals', 450, 1500000.00, 1),
(2, 14, 'Sneha Kulkarni', '2026-12-05', 'Bangalore', 'Karnataka', '102 Whitefield Main Rd', 'Bohemian Pastel Garden', 350, 1200000.00, 1),
(3, 15, 'Pooja Hegde', '2026-12-18', 'Bangalore', 'Karnataka', '55 JP Nagar Phase 6', 'Traditional South Indian Temple Style', 500, 1800000.00, 1),
(4, 16, 'Meera Nambiar', '2027-01-15', 'Bangalore', 'Karnataka', '18 Cunningham Road', 'Modern Minimalist Luxury', 300, 1100000.00, 2),
(5, 17, 'Deepika Sundaram', '2027-02-10', 'Bangalore', 'Karnataka', '84 Benson Town', 'Grand Bollywood Glitz', 600, 2200000.00, 1),
(6, 18, 'Ria Deshmukh', '2027-02-24', 'Bangalore', 'Karnataka', '29 Rajajinagar', 'Vintage Royal Maratha', 400, 1350000.00, 2),
(7, 19, 'Tanvi Joshi', '2027-03-12', 'Bangalore', 'Karnataka', '91 Electronic City', 'Enchanted Forest & Fairy Lights', 350, 1250000.00, 1),
(8, 20, 'Divya Pillai', '2027-04-05', 'Bangalore', 'Karnataka', '12 Cooke Town', 'Classical Kerala Backwaters', 300, 1050000.00, 2),
(9, 21, 'Bhavana Reddy', '2027-04-22', 'Bangalore', 'Karnataka', '67 Kalyan Nagar', 'Opulent Gold & Crimson', 550, 2000000.00, 1),
(10, 22, 'Ishita Sen', '2027-05-14', 'Bangalore', 'Karnataka', '43 Basavanagudi', 'Elegance by the Lake', 250, 950000.00, 2)
ON DUPLICATE KEY UPDATE `partner_name` = VALUES(`partner_name`);

-- 8. WEDDING PROJECTS (10 Projects corresponding to Customers)
INSERT INTO `wedding_projects` (`id`, `project_code`, `customer_id`, `planner_id`, `title`, `wedding_date`, `venue_name`, `venue_address`, `city`, `guest_count`, `total_budget`, `status`, `notes`) VALUES
(1, 'WP-2026-001', 1, 1, 'Rahul & Anita Royal Nuptials', '2026-11-20', 'The Grand Royal Palace', '88 Palace Cross Road', 'Bangalore', 450, 1500000.00, 'IN_PROGRESS', 'Core vendors arranged, advance paid, final decor review pending.'),
(2, 'WP-2026-002', 2, 1, 'Rohit & Sneha Pastel Dream Wedding', '2026-12-05', 'The Tamarind Tree Heritage Lawns', 'Avalahalli, Anjanapura', 'Bangalore', 350, 1200000.00, 'CONFIRMED', 'All bookings locked, advance and second payments completed.'),
(3, 'WP-2026-003', 3, 1, 'Siddharth & Pooja Traditional Muhurtham', '2026-12-18', 'Gayathri Vihar Palace Grounds', 'Bellary Road', 'Bangalore', 500, 1800000.00, 'PLANNING', 'Vendor requests in review, customer checking photography options.'),
(4, 'WP-2027-004', 4, 2, 'Aditya & Meera Minimalist Celebration', '2027-01-15', 'TempleTree Leisure', 'Panathur Main Road', 'Bangalore', 300, 1100000.00, 'PLANNING', 'Customer requested change on catering vendor, planner re-assigning.'),
(5, 'WP-2027-005', 5, 1, 'Karthik & Deepika Bollywood Extravaganza', '2027-02-10', 'JW Marriott Grand Ballroom', 'Vittal Mallya Road', 'Bangalore', 600, 2200000.00, 'IN_PROGRESS', 'DJ, sound, and bridal couture vendor accepted.'),
(6, 'WP-2027-006', 6, 2, 'Varun & Ria Heritage Wedding', '2027-02-24', 'Shanku Convention Centre', 'Kanakapura Road', 'Bangalore', 400, 1350000.00, 'PLANNING', 'Requirements submitted, venue availability verified.'),
(7, 'WP-2027-007', 7, 1, 'Abhishek & Tanvi Enchanted Wedding', '2027-03-12', 'The Peacock Grove', 'Bagalur Main Rd', 'Bangalore', 350, 1250000.00, 'PLANNING', 'Requirements reviewed, pending vendor requests dispatch.'),
(8, 'WP-2027-008', 8, 2, 'Manoj & Divya Lakeview Ceremony', '2027-04-05', 'Miraya Greens', 'Sakhalavara Road', 'Bangalore', 300, 1050000.00, 'PLANNING', 'Initial customer requirements captured.'),
(9, 'WP-2027-009', 9, 1, 'Naveen & Bhavana Royal Mandap', '2027-04-22', 'Goldfinch Retreat', 'Tarabanahalli', 'Bangalore', 550, 2000000.00, 'PLANNING', 'Budget allocations configured.'),
(10, 'WP-2025-010', 10, 2, 'Gautam & Ishita Intimate Wedding', '2026-08-15', 'Gitanjali Gardens', 'Whitefield', 'Bangalore', 250, 950000.00, 'COMPLETED', 'Wedding ceremony concluded successfully with five-star reviews.')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- 9. WEDDING REQUIREMENTS
INSERT INTO `wedding_requirements` (`id`, `customer_id`, `wedding_project_id`, `wedding_date`, `location`, `guest_count`, `estimated_budget`, `required_services`, `special_preferences`, `status`) VALUES
(1, 1, 1, '2026-11-20', 'Bangalore', 450, 1500000.00, '["photography", "decoration", "wedding-hall", "catering", "makeup", "music"]', 'Prefer royal gold and crimson theme with South Indian traditional breakfast and multi-cuisine reception.', 'CONVERTED_TO_PROJECT'),
(2, 2, 2, '2026-12-05', 'Bangalore', 350, 1200000.00, '["photography", "decoration", "catering", "mehendi", "dj"]', 'Pastel floral mandap with fairy lights and energetic evening DJ.', 'CONVERTED_TO_PROJECT'),
(3, 3, 3, '2026-12-18', 'Bangalore', 500, 1800000.00, '["wedding-hall", "photography", "decoration", "catering", "transportation"]', 'Traditional temple architecture style stage and live classical fusion music.', 'CONVERTED_TO_PROJECT'),
(4, 4, 4, '2027-01-15', 'Bangalore', 300, 1100000.00, '["catering", "photography", "decoration", "makeup"]', 'Strictly eco-friendly, zero-plastic wedding decor with local organic catering.', 'CONVERTED_TO_PROJECT'),
(5, 5, 5, '2027-02-10', 'Bangalore', 600, 2200000.00, '["wedding-hall", "dj", "photography", "bridal-wear", "decoration", "transportation"]', 'Grand Sangeet with concert-style lighting, LED wall, and luxury vintage car for baarat.', 'CONVERTED_TO_PROJECT'),
(6, 6, 6, '2027-02-24', 'Bangalore', 400, 1350000.00, '["wedding-hall", "decoration", "catering", "music"]', 'Royal Maratha traditional rituals with classical shehnai troupe.', 'CONVERTED_TO_PROJECT'),
(7, 7, 7, '2027-03-12', 'Bangalore', 350, 1250000.00, '["photography", "decoration", "catering", "mehendi"]', 'Rustic outdoor lawn setting with fairy lights and organic henna counters.', 'CONVERTED_TO_PROJECT'),
(8, 8, 8, '2027-04-05', 'Bangalore', 300, 1050000.00, '["wedding-hall", "catering", "photography", "makeup"]', 'Morning muhurtham with traditional plantain leaf Kerala feast.', 'CONVERTED_TO_PROJECT'),
(9, 9, 9, '2027-04-22', 'Bangalore', 550, 2000000.00, '["wedding-hall", "decoration", "catering", "dj", "bridal-wear"]', 'Opulent Telugu wedding traditions, grand entrance arch, and designer couture.', 'CONVERTED_TO_PROJECT'),
(10, 10, 10, '2026-08-15', 'Bangalore', 250, 950000.00, '["photography", "catering", "decoration"]', 'Intimate lakeside gathering with candid photography and acoustic violin.', 'CONVERTED_TO_PROJECT')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- 10. VENDOR AVAILABILITY (Demonstrating AVAILABLE, BOOKED, UNAVAILABLE, and RESERVED)
INSERT INTO `vendor_availability` (`id`, `vendor_id`, `date`, `start_time`, `end_time`, `status`, `reason`) VALUES
(1, 1, '2026-11-20', '08:00:00', '22:00:00', 'BOOKED', 'Confirmed for Rahul & Anita Wedding (WP-2026-001)'),
(2, 2, '2026-11-20', '06:00:00', '23:00:00', 'BOOKED', 'Stage set up for Rahul & Anita Wedding'),
(3, 3, '2026-11-20', '06:00:00', '23:59:00', 'BOOKED', 'Main Palace Hall reserved for Project WP-2026-001'),
(4, 4, '2026-11-20', '07:00:00', '22:00:00', 'BOOKED', 'Full banquet service for WP-2026-001'),
(5, 5, '2026-11-20', '05:00:00', '14:00:00', 'BOOKED', 'Bridal makeover appointment for Anita Verma'),
(6, 1, '2026-12-05', '08:00:00', '22:00:00', 'BOOKED', 'Confirmed for Rohit & Sneha Wedding (WP-2026-002)'),
(7, 2, '2026-12-05', '07:00:00', '23:00:00', 'BOOKED', 'Pastel Mandap setup for Rohit & Sneha'),
(8, 7, '2026-12-05', '16:00:00', '23:30:00', 'BOOKED', 'Sangeet DJ for Project WP-2026-002'),
(9, 1, '2026-12-18', '08:00:00', '22:00:00', 'RESERVED', 'Temporarily held for Siddharth & Pooja Wedding proposal'),
(10, 4, '2026-12-18', '07:00:00', '22:00:00', 'UNAVAILABLE', 'Vendor personal annual holiday / kitchen maintenance'),
(11, 1, '2027-01-15', '08:00:00', '22:00:00', 'AVAILABLE', 'Open for bookings'),
(12, 2, '2027-01-15', '08:00:00', '22:00:00', 'AVAILABLE', 'Open for bookings'),
(13, 3, '2027-01-15', '06:00:00', '23:59:00', 'AVAILABLE', 'Palace Ballroom available'),
(14, 7, '2027-02-10', '17:00:00', '23:59:00', 'BOOKED', 'Locked for Bollywood Wedding WP-2027-005'),
(15, 10, '2027-02-10', '15:00:00', '21:00:00', 'BOOKED', 'Vintage car booked for groom entry WP-2027-005')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- 11. VENDOR REQUESTS (Sent ONLY by Planner; Shows PENDING, ACCEPTED, and DECLINED with decline reason)
INSERT INTO `vendor_requests` (`id`, `request_code`, `wedding_project_id`, `planner_id`, `vendor_id`, `service_id`, `event_date`, `start_time`, `end_time`, `proposed_price`, `notes`, `status`, `decline_reason`, `responded_at`) VALUES
-- Project 1 (Accepted requests)
(1, 'REQ-2026-001', 1, 1, 1, 1, '2026-11-20', '08:00:00', '22:00:00', 140000.00, '2-Day Candid & Cinematic Package for Rahul & Anita Verma', 'ACCEPTED', NULL, '2026-09-02 11:30:00'),
(2, 'REQ-2026-002', 1, 1, 2, 3, '2026-11-20', '06:00:00', '23:00:00', 220000.00, 'Grand Royal Palace Stage & Mandap Floral Decor', 'ACCEPTED', NULL, '2026-09-02 12:15:00'),
(3, 'REQ-2026-003', 1, 1, 3, 5, '2026-11-20', '06:00:00', '23:59:00', 450000.00, 'Full Heritage Palace Ballroom & Lawns', 'ACCEPTED', NULL, '2026-09-02 14:00:00'),
(4, 'REQ-2026-004', 1, 1, 5, 7, '2026-11-20', '05:00:00', '14:00:00', 35000.00, 'Bridal Deluxe HD Airbrush Makeup for Anita Verma', 'ACCEPTED', NULL, '2026-09-02 15:20:00'),

-- Project 2 (Accepted requests)
(5, 'REQ-2026-005', 2, 1, 1, 1, '2026-12-05', '08:00:00', '22:00:00', 135000.00, 'Full day photography and cinematic teaser', 'ACCEPTED', NULL, '2026-09-05 10:00:00'),
(6, 'REQ-2026-006', 2, 1, 2, 4, '2026-12-05', '07:00:00', '23:00:00', 65000.00, 'Bohemian Pastel Garden Mandap Setup', 'ACCEPTED', NULL, '2026-09-05 11:45:00'),
(7, 'REQ-2026-007', 2, 1, 7, 9, '2026-12-05', '16:00:00', '23:30:00', 60000.00, 'Sangeet DJ and dynamic intelligent lighting', 'ACCEPTED', NULL, '2026-09-05 14:30:00'),

-- Project 3 (Pending request)
(8, 'REQ-2026-008', 3, 1, 1, 1, '2026-12-18', '08:00:00', '22:00:00', 140000.00, 'Checking if Vikram can cover traditional South Indian temple wedding', 'PENDING', NULL, NULL),

-- Project 4 (Demonstrates DECLINE WORKFLOW: Vendor 4 declined with specific reason)
(9, 'REQ-2026-009', 4, 2, 4, 6, '2027-01-15', '07:00:00', '22:00:00', 425000.00, 'Request for 300 pax traditional wedding lunch', 'DECLINED', 'Regretfully, our central kitchen is undergoing scheduled renovation during this week and we cannot guarantee 100% capacity.', '2026-09-10 16:20:00'),

-- Replacement request sent by Planner 2 after decline:
(10, 'REQ-2026-010', 4, 2, 8, 10, '2027-01-15', '09:00:00', '14:00:00', 45000.00, 'Live classical band replacement request', 'PENDING', NULL, NULL),

-- Project 5 (Accepted requests)
(11, 'REQ-2027-011', 5, 1, 7, 9, '2027-02-10', '17:00:00', '23:59:00', 65000.00, 'Concert-grade sound & DJ setup for Grand Sangeet', 'ACCEPTED', NULL, '2026-09-12 18:00:00'),
(12, 'REQ-2027-012', 5, 1, 10, 12, '2027-02-10', '15:00:00', '21:00:00', 35000.00, '1947 Classic Vintage Car for Groom Baarat', 'ACCEPTED', NULL, '2026-09-12 18:45:00')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- 12. BOOKINGS
INSERT INTO `bookings` (`id`, `booking_code`, `wedding_project_id`, `customer_id`, `planner_id`, `total_amount`, `advance_amount`, `paid_amount`, `status`, `customer_feedback`) VALUES
(1, 'BK-2026-001', 1, 1, 1, 845000.00, 250000.00, 550000.00, 'PARTIALLY_PAID', 'Vendor arrangements look majestic. Advance and 2nd payments transferred smoothly.'),
(2, 'BK-2026-002', 2, 2, 1, 260000.00, 80000.00, 260000.00, 'CONFIRMED', 'Completely satisfied with pastel theme vendors and DJ setup.'),
(3, 'BK-2026-003', 3, 3, 1, 140000.00, 40000.00, 0.00, 'CUSTOMER_APPROVAL', 'Reviewing proposed photography arrangement by Planner Priya.'),
(4, 'BK-2026-004', 4, 4, 2, 45000.00, 15000.00, 0.00, 'REQUESTED', 'Waiting for new catering vendor arrangement following previous decline.'),
(5, 'BK-2026-005', 5, 1, 1, 100000.00, 30000.00, 30000.00, 'PARTIALLY_PAID', 'Advance paid for Sangeet DJ and Vintage Car.'),
(10, 'BK-2025-010', 10, 10, 2, 185000.00, 50000.00, 185000.00, 'COMPLETED', 'Thank you Arjun for the flawless execution of our wedding day!')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- 13. BOOKING SERVICES
INSERT INTO `booking_services` (`id`, `booking_id`, `vendor_id`, `vendor_request_id`, `service_id`, `service_name`, `category_name`, `agreed_price`, `status`, `notes`) VALUES
(1, 1, 1, 1, 1, 'Signature 2-Day Candid & Cinematic Package', 'Photography', 140000.00, 'CONFIRMED', 'Includes pre-wedding drone reel'),
(2, 1, 2, 2, 3, 'Grand Royal Palace Stage & Mandap Decor', 'Decoration', 220000.00, 'CONFIRMED', 'Floral theme approved by customer'),
(3, 1, 3, 3, 5, 'Full Heritage Palace Ballroom & Lawn (1 Day)', 'Wedding Hall', 450000.00, 'CONFIRMED', 'Main banquet hall booked'),
(4, 1, 5, 4, 7, 'Bridal Deluxe HD Airbrush & Hair Package', 'Makeup', 35000.00, 'CONFIRMED', 'Airbrush makeup for morning muhurtham and evening reception'),
(5, 2, 1, 5, 1, 'Signature 2-Day Candid & Cinematic Package', 'Photography', 135000.00, 'CONFIRMED', 'Includes traditional album and candid highlights'),
(6, 2, 2, 6, 4, 'Haldi & Mehendi Vibrant Bohemian Setup', 'Decoration', 65000.00, 'CONFIRMED', 'Boho swing and pastel floral canopy'),
(7, 2, 7, 7, 9, 'Sangeet Party DJ, Truss & Laser Setup', 'DJ', 60000.00, 'CONFIRMED', 'High energy LED dance floor setup'),
(8, 3, 1, 8, 1, 'Signature 2-Day Candid & Cinematic Package', 'Photography', 140000.00, 'PROPOSED', 'Awaiting customer final sign-off'),
(9, 5, 7, 11, 9, 'Sangeet Party DJ, Truss & Laser Setup', 'DJ', 65000.00, 'CONFIRMED', 'Concert audio setup'),
(10, 5, 10, 12, 12, '1947 Classic Vintage Car Rental (Bridal Entry)', 'Transportation', 35000.00, 'CONFIRMED', 'Vintage roadster entry confirmed')
ON DUPLICATE KEY UPDATE `agreed_price` = VALUES(`agreed_price`);

-- 14. PAYMENTS (Structured milestones: Advance, Second Payment, Final Payment)
INSERT INTO `payments` (`id`, `payment_code`, `booking_id`, `wedding_project_id`, `customer_id`, `title`, `milestone_name`, `amount`, `due_date`, `status`) VALUES
-- Booking 1 (Total: ₹8,45,000 | Advance: ₹2,50,000 [Paid], Second: ₹3,00,000 [Paid], Final: ₹2,95,000 [Pending])
(1, 'PAY-2026-001-A', 1, 1, 1, 'Wedding Advance Retainer', 'Advance', 250000.00, '2026-09-05', 'SUCCESS'),
(2, 'PAY-2026-001-B', 1, 1, 1, 'Second Milestone Payment (Vendor Lock-in)', 'Second Payment', 300000.00, '2026-10-05', 'SUCCESS'),
(3, 'PAY-2026-001-C', 1, 1, 1, 'Final Settlement Balance', 'Final Payment', 295000.00, '2026-11-15', 'PENDING'),

-- Booking 2 (Total: ₹2,60,000 | Fully Paid)
(4, 'PAY-2026-002-A', 2, 2, 2, 'Booking Advance', 'Advance', 80000.00, '2026-09-10', 'SUCCESS'),
(5, 'PAY-2026-002-B', 2, 2, 2, 'Second Installment', 'Second Payment', 100000.00, '2026-10-15', 'SUCCESS'),
(6, 'PAY-2026-002-C', 2, 2, 2, 'Final Wedding Settlement', 'Final Payment', 80000.00, '2026-11-25', 'SUCCESS'),

-- Booking 5 (Advance paid)
(7, 'PAY-2027-005-A', 5, 5, 5, 'DJ & Vintage Car Advance', 'Advance', 30000.00, '2026-09-15', 'SUCCESS'),
(8, 'PAY-2027-005-B', 5, 5, 5, 'Second Milestone', 'Second Payment', 40000.00, '2026-12-15', 'PENDING'),
(9, 'PAY-2027-005-C', 5, 5, 5, 'Final Balance', 'Final Payment', 30000.00, '2027-02-01', 'PENDING'),

-- Booking 10 (Completed)
(10, 'PAY-2025-010-A', 10, 10, 10, 'Full Settlement', 'Full Payment', 185000.00, '2026-08-10', 'SUCCESS')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- 15. PAYMENT TRANSACTIONS (Mock payment entries with realistic references)
INSERT INTO `payment_transactions` (`id`, `payment_id`, `transaction_reference`, `payment_method`, `amount`, `currency`, `status`, `gateway_response`, `paid_at`) VALUES
(1, 1, 'TXN_MOCK_9928172601', 'MOCK_UPI', 250000.00, 'INR', 'SUCCESS', '{"method": "UPI", "upi_id": "rahul.verma@okaxis", "bank_ref": "AXIS9918231"}', '2026-09-05 14:22:10'),
(2, 2, 'TXN_MOCK_9928172602', 'MOCK_CARD', 300000.00, 'INR', 'SUCCESS', '{"method": "CARD", "card_brand": "Visa", "last4": "4242", "auth_code": "AUTH8812"}', '2026-09-15 16:45:00'),
(3, 4, 'TXN_MOCK_8829171501', 'MOCK_UPI', 80000.00, 'INR', 'SUCCESS', '{"method": "UPI", "upi_id": "rohit.k@okhdfcbank", "bank_ref": "HDFC1120938"}', '2026-09-10 11:10:00'),
(4, 5, 'TXN_MOCK_8829171502', 'MOCK_NETBANKING', 100000.00, 'INR', 'SUCCESS', '{"method": "NETBANKING", "bank": "HDFC Bank", "utr": "HDFCNET220192"}', '2026-09-18 10:30:00'),
(5, 6, 'TXN_MOCK_8829171503', 'MOCK_UPI', 80000.00, 'INR', 'SUCCESS', '{"method": "UPI", "upi_id": "rohit.k@okhdfcbank", "bank_ref": "HDFC4491028"}', '2026-09-19 18:05:00'),
(6, 7, 'TXN_MOCK_7718291001', 'MOCK_UPI', 30000.00, 'INR', 'SUCCESS', '{"method": "UPI", "upi_id": "karthik.s@okicici", "bank_ref": "ICICI882716"}', '2026-09-15 12:12:00'),
(7, 10, 'TXN_MOCK_6619283701', 'MOCK_NETBANKING', 185000.00, 'INR', 'SUCCESS', '{"method": "NETBANKING", "bank": "SBI", "utr": "SBIN2291823"}', '2026-08-10 09:30:00')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- 16. INVOICES
INSERT INTO `invoices` (`id`, `invoice_number`, `booking_id`, `payment_id`, `issuer_id`, `recipient_id`, `subtotal`, `tax_amount`, `total_amount`, `status`, `due_date`, `pdf_url`) VALUES
(1, 'INV-2026-001', 1, 1, 1, 13, 250000.00, 0.00, 250000.00, 'PAID', '2026-09-05', '/uploads/invoices/INV-2026-001.pdf'),
(2, 'INV-2026-002', 1, 2, 1, 13, 300000.00, 0.00, 300000.00, 'PAID', '2026-10-05', '/uploads/invoices/INV-2026-002.pdf'),
(3, 'INV-2026-003', 1, 3, 1, 13, 295000.00, 0.00, 295000.00, 'ISSUED', '2026-11-15', '/uploads/invoices/INV-2026-003.pdf'),
(4, 'INV-2026-004', 2, 4, 1, 14, 80000.00, 0.00, 80000.00, 'PAID', '2026-09-10', '/uploads/invoices/INV-2026-004.pdf'),
(5, 'INV-2026-005', 2, 5, 1, 14, 100000.00, 0.00, 100000.00, 'PAID', '2026-10-15', '/uploads/invoices/INV-2026-005.pdf'),
(6, 'INV-2026-006', 2, 6, 1, 14, 80000.00, 0.00, 80000.00, 'PAID', '2026-11-25', '/uploads/invoices/INV-2026-006.pdf'),
(7, 'INV-2027-007', 5, 7, 1, 17, 30000.00, 0.00, 30000.00, 'PAID', '2026-09-15', '/uploads/invoices/INV-2027-007.pdf')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- 17. BUDGETS (Normalized MySQL financial records)
INSERT INTO `budgets` (`id`, `wedding_project_id`, `total_budget`, `allocated_amount`, `spent_amount`, `remaining_amount`) VALUES
(1, 1, 1500000.00, 1250000.00, 550000.00, 250000.00),
(2, 2, 1200000.00, 1050000.00, 260000.00, 150000.00),
(3, 3, 1800000.00, 1400000.00, 0.00, 400000.00),
(4, 4, 1100000.00, 850000.00, 0.00, 250000.00),
(5, 5, 2200000.00, 1900000.00, 30000.00, 300000.00),
(6, 6, 1350000.00, 1100000.00, 0.00, 250000.00),
(7, 7, 1250000.00, 1000000.00, 0.00, 250000.00),
(8, 8, 1050000.00, 800000.00, 0.00, 250000.00),
(9, 9, 2000000.00, 1700000.00, 0.00, 300000.00),
(10, 10, 950000.00, 950000.00, 185000.00, 0.00)
ON DUPLICATE KEY UPDATE `total_budget` = VALUES(`total_budget`);

-- 18. BUDGET ITEMS (Categories matching the requirement)
INSERT INTO `budget_items` (`id`, `budget_id`, `category_id`, `item_name`, `estimated_cost`, `actual_cost`, `paid_cost`, `status`, `notes`) VALUES
(1, 1, 1, 'Wedding Hall (The Grand Royal Palace)', 450000.00, 450000.00, 250000.00, 'BOOKED', 'Full day venue hire'),
(2, 1, 3, 'Decoration & Mandap (Bloom & Blossom)', 250000.00, 220000.00, 150000.00, 'BOOKED', 'Royal red & gold floral mandap'),
(3, 1, 4, 'Photography & 4K Cinema (Shutter & Soul)', 150000.00, 140000.00, 100000.00, 'BOOKED', '2-day coverage with drone'),
(4, 1, 2, 'Catering Feast (500 pax estimate)', 450000.00, 425000.00, 0.00, 'PLANNED', 'Chef menu finalized'),
(5, 1, 7, 'Bridal Makeover (Glamour Studio)', 40000.00, 35000.00, 50000.00, 'PAID', 'Airbrush makeup for 2 sessions'),
(6, 2, 4, 'Photography (Shutter & Soul)', 140000.00, 135000.00, 135000.00, 'PAID', 'Pastel aesthetic photo reel'),
(7, 2, 3, 'Bohemian Floral Decor', 80000.00, 65000.00, 65000.00, 'PAID', 'Tamarind Tree lawn decor'),
(8, 2, 8, 'Sangeet DJ & Light Show', 70000.00, 60000.00, 60000.00, 'PAID', 'High power audio & DJ setup')
ON DUPLICATE KEY UPDATE `actual_cost` = VALUES(`actual_cost`);

-- 19. WEDDING SCHEDULE (Day-of timelines)
INSERT INTO `wedding_schedule` (`id`, `wedding_project_id`, `event_title`, `event_date`, `start_time`, `end_time`, `location`, `description`, `person_in_charge`, `vendor_id`, `status`) VALUES
(1, 1, 'Bridal Makeup & Saree Draping', '2026-11-20', '05:30:00', '08:00:00', 'Suite 101, Grand Royal Palace', 'Bridal preparation with HD airbrush makeup', 'Kavita Menon', 5, 'SCHEDULED'),
(2, 1, 'Baraat & Groom Arrival Procession', '2026-11-20', '08:30:00', '09:30:00', 'Palace North Gate', 'Procession with dhol players and floral umbrella', 'Priya Sharma (Planner)', NULL, 'SCHEDULED'),
(3, 1, 'Sacred Muhurtham & Kanyadaan', '2026-11-20', '09:45:00', '11:45:00', 'Main Kalyana Mandapam', 'Vedic wedding ceremony rituals and mangalsutra tying', 'Priest Shastri Ji', 1, 'SCHEDULED'),
(4, 1, 'Traditional Banquet Lunch', '2026-11-20', '12:00:00', '15:00:00', 'Dining Pavilion', '32-item traditional feast on plantain leaves', 'Chef Rajesh Nair', 4, 'SCHEDULED'),
(5, 1, 'Grand Reception & Live Music', '2026-11-20', '18:30:00', '22:30:00', 'Main Ballroom', 'Cake cutting, couple stage meet, and live violin-flute fusion', 'Priya Sharma', 8, 'SCHEDULED'),
(6, 2, 'Haldi & Phoolon Ki Holi', '2026-12-05', '10:00:00', '13:00:00', 'Tamarind Tree Courtyard', 'Joyful family haldi with yellow flower petals', 'Arjun Kapoor', 2, 'SCHEDULED'),
(7, 2, 'Sangeet Night & DJ Bash', '2026-12-05', '19:00:00', '23:30:00', 'Lawn Amphitheatre', 'Family choreography dance performances followed by open DJ floor', 'DJ Rohit Roy', 7, 'SCHEDULED')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- 20. DOCUMENTS
INSERT INTO `documents` (`id`, `wedding_project_id`, `uploader_id`, `title`, `document_type`, `file_path`, `file_size`, `file_type`, `status`) VALUES
(1, 1, 1, 'Master Wedding Coordination Contract', 'CONTRACT', '/uploads/docs/wp-001-contract.pdf', 1048576, 'application/pdf', 'ACTIVE'),
(2, 1, 1, 'Grand Royal Palace Booking Agreement', 'CONTRACT', '/uploads/docs/palace-agreement.pdf', 845000, 'application/pdf', 'ACTIVE'),
(3, 1, 1, 'Floral Mandap 3D Blueprint Design', 'DESIGN_SKETCH', '/uploads/docs/mandap-sketch.pdf', 2048576, 'application/pdf', 'ACTIVE'),
(4, 1, 1, 'Guest Seating & VIP Table Plan', 'CHECKLIST', '/uploads/docs/seating-plan.pdf', 524288, 'application/pdf', 'ACTIVE'),
(5, 2, 1, 'Tamarind Tree Garden Agreement', 'CONTRACT', '/uploads/docs/garden-contract.pdf', 920000, 'application/pdf', 'ACTIVE')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- 21. CONVERSATIONS & MESSAGES (Planner <-> Customer, Planner <-> Vendor)
INSERT INTO `conversations` (`id`, `wedding_project_id`, `participant_one_id`, `participant_two_id`, `last_message_at`) VALUES
-- Planner Priya (1) <-> Customer Rahul Verma (13)
(1, 1, 1, 13, '2026-09-18 15:40:00'),
-- Planner Priya (1) <-> Vendor Vikram Rathore (3)
(2, 1, 1, 3, '2026-09-18 16:10:00'),
-- Planner Priya (1) <-> Vendor Ananya Roy (4)
(3, 1, 1, 4, '2026-09-18 17:00:00'),
-- Planner Arjun (2) <-> Customer Aditya Nambiar (16)
(4, 4, 2, 16, '2026-09-15 14:00:00')
ON DUPLICATE KEY UPDATE `last_message_at` = VALUES(`last_message_at`);

INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `recipient_id`, `message_text`, `is_read`, `read_at`) VALUES
(1, 1, 13, 1, 'Hi Priya, we reviewed the photography portfolio for Vikram. The candid portraits are spectacular!', TRUE, '2026-09-18 14:00:00'),
(2, 1, 1, 13, 'Thank you Rahul! Vikram has reserved your dates for November 20th. I have attached the stage floral blueprint for your approval.', TRUE, '2026-09-18 14:15:00'),
(3, 1, 13, 1, 'Approved! We made the second milestone payment just now.', TRUE, '2026-09-18 15:40:00'),
(4, 2, 1, 3, 'Hi Vikram, Rahul & Anita have officially approved your package. Please lock Nov 20 in your calendar.', TRUE, '2026-09-18 16:00:00'),
(5, 2, 3, 1, 'Awesome Priya! The date is firmly blocked. We will plan the pre-wedding shoot for next month.', TRUE, '2026-09-18 16:10:00'),
(6, 4, 2, 16, 'Hi Aditya, regarding your catering preference, Royal Feast declined due to renovation. I am sourcing another top gourmet caterer for you today.', TRUE, '2026-09-15 14:00:00')
ON DUPLICATE KEY UPDATE `is_read` = VALUES(`is_read`);

-- 22. NOTIFICATIONS (Realistic database notification logs)
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `notification_type`, `reference_id`, `reference_type`, `is_read`) VALUES
(1, 1, 'New Wedding Requirement Submitted', 'Customer Rahul Verma submitted wedding requirements for November 2026.', 'SYSTEM', 1, 'requirement', TRUE),
(2, 3, 'New Booking Request Received', 'Planner Priya Sharma requested your Candid & Cinematic Package for Nov 20, 2026.', 'REQUEST_NEW', 1, 'vendor_request', TRUE),
(3, 1, 'Vendor Accepted Request', 'Vikram Rathore accepted booking request REQ-2026-001 for ₹1,40,000.', 'REQUEST_ACCEPTED', 1, 'vendor_request', TRUE),
(4, 13, 'Vendor Arrangement Ready for Approval', 'Planner Priya arranged photography, floral decor, and palace venue for your wedding.', 'CUSTOMER_APPROVAL', 1, 'booking', TRUE),
(5, 1, 'Customer Approved Arrangement', 'Rahul Verma approved the vendor arrangement for Project WP-2026-001.', 'CUSTOMER_APPROVED', 1, 'booking', TRUE),
(6, 13, 'Advance Payment Received', 'Advance payment of ₹2,50,000 was successfully processed via UPI.', 'PAYMENT_SUCCESS', 1, 'payment', TRUE),
(7, 2, 'Vendor Request Declined', 'Chef Rajesh Nair declined request REQ-2026-009 with reason: Kitchen renovation.', 'REQUEST_DECLINED', 9, 'vendor_request', TRUE),
(8, 14, 'All Services Confirmed!', 'All wedding services for Sneha & Rohit are locked and confirmed.', 'BOOKING_CONFIRMED', 2, 'booking', FALSE),
(9, 13, 'New Message from Planner', 'Priya Sharma: "Vikram has reserved your dates for November 20th..."', 'MESSAGE', 1, 'conversation', FALSE)
ON DUPLICATE KEY UPDATE `is_read` = VALUES(`is_read`);

-- 23. REVIEWS & RATINGS (For completed weddings)
INSERT INTO `reviews` (`id`, `wedding_project_id`, `booking_id`, `customer_id`, `vendor_id`, `planner_id`, `rating`, `review_text`, `response_text`) VALUES
(1, 10, 10, 10, 1, 2, 5, 'Vikram captured our sunset vows so poetically. Looking through the album made us tear up again! Absolute master of candid storytelling.', 'Thank you so much Gautam and Ishita! It was an absolute honor to capture your special day.'),
(2, 10, 10, 10, 2, 2, 5, 'Ananya and her decor team transformed Gitanjali Gardens into a fairytale. The fairy light tunnel was unforgettable.', 'Thank you for your warmth and trust! Wishing you both a lifetime of happiness.'),
(3, 10, 10, 10, NULL, 2, 5, 'Planner Arjun Kapoor made our wedding stress-free. Every vendor arrived on time and the day flowed like clockwork.', 'Thank you Gautam! Working with your families was a pure joy.')
ON DUPLICATE KEY UPDATE `rating` = VALUES(`rating`);

-- 24. WISHLISTS
INSERT INTO `wishlists` (`id`, `customer_id`, `vendor_id`, `service_id`, `notes`) VALUES
(1, 1, 9, 11, 'Beautiful bridal couture lehenga for reception'),
(2, 1, 10, 12, '1947 Vintage car for midnight send-off photo session'),
(3, 2, 5, 7, 'Hair and makeup look reference for sangeet'),
(4, 3, 8, 10, 'Live classical fusion band for morning mandap')
ON DUPLICATE KEY UPDATE `notes` = VALUES(`notes`);

-- 25. SUPPORT REQUESTS
INSERT INTO `support_requests` (`id`, `user_id`, `ticket_number`, `subject`, `category`, `priority`, `status`, `message`, `resolution_notes`) VALUES
(1, 13, 'TCK-2026-101', 'Need GST Invoice copy for corporate records', 'BILLING', 'MEDIUM', 'RESOLVED', 'Please provide a downloadable GST invoice breakdown for our advance payment.', 'Invoice INV-2026-001 updated with GSTIN and sent to customer email.'),
(2, 16, 'TCK-2026-102', 'Catering vendor change clarification', 'GENERAL', 'HIGH', 'IN_PROGRESS', 'Need help understanding the alternative caterers available for January 15th.', 'Planner Arjun is contacting two premier vegetarian caterers with organic menus.'),
(3, 3, 'TCK-2026-103', 'Calendar sync query', 'TECHNICAL', 'LOW', 'RESOLVED', 'Can I export the platform availability calendar to Google Calendar?', 'Provided iCal sync instructions.')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- 26. CHATBOT CONVERSATIONS & SAMPLE MESSAGES
INSERT INTO `chatbot_conversations` (`id`, `user_id`, `session_token`, `title`) VALUES
(1, 13, 'sess_cust_13_abc123', 'Customer Rahul Assistant Session'),
(2, 1, 'sess_plan_1_def456', 'Planner Priya Assistant Session'),
(3, 3, 'sess_vend_3_ghi789', 'Vendor Vikram Assistant Session')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

INSERT INTO `chatbot_messages` (`id`, `conversation_id`, `sender`, `message_text`, `metadata`) VALUES
(1, 1, 'USER', 'What is my booking status and how much have I paid?', '{"intent": "booking_status"}'),
(2, 1, 'BOT', 'Hello Rahul! Your wedding project "Rahul & Anita Royal Nuptials" is currently PARTIALLY_PAID. You have paid ₹5,50,000 out of ₹8,45,000 total. Your final settlement of ₹2,95,000 is due on Nov 15, 2026.', '{"role": "CUSTOMER"}'),
(3, 2, 'USER', 'How many pending vendor requests do I have?', '{"intent": "pending_requests"}'),
(4, 2, 'BOT', 'Hello Priya! You currently have 1 pending vendor request (REQ-2026-008 for Shutter & Soul Studios on Dec 18, 2026). All other requests have been accepted.', '{"role": "PLANNER"}'),
(5, 3, 'USER', 'Show my upcoming bookings', '{"intent": "vendor_bookings"}'),
(6, 3, 'BOT', 'Hello Vikram! You have 2 confirmed bookings coming up: Nov 20, 2026 for Rahul & Anita, and Dec 05, 2026 for Rohit & Sneha.', '{"role": "VENDOR"}')
ON DUPLICATE KEY UPDATE `message_text` = VALUES(`message_text`);
