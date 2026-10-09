# Wedding Planner & Vendor Coordination Platform (WPVCP) - Database Guide

## 1. Database Specifications
- **DBMS**: MySQL 8.0+
- **Database Name**: `wedding_planner`
- **Charset**: `utf8mb4`
- **Collation**: `utf8mb4_unicode_ci`
- **Normalization**: 3NF (Third Normal Form) with foreign key cascades and strict constraints

## 2. Table Architecture (28 Tables)
1. `roles`: Core platform roles (`PLANNER`, `VENDOR`, `CUSTOMER`)
2. `users`: Base account credentials, bcrypt hashes, Google provider references
3. `planners`: Wedding director agencies, experience, portfolios
4. `service_categories`: 16 database-driven categories (Hall, Catering, Decor, Photo, DJ, etc.)
5. `vendors`: Service vendor profiles, cities, base prices, ratings
6. `vendor_services`: Detailed package items with pricing units
7. `customers`: Bride & groom profiles, wedding dates, guest count, budgets
8. `wedding_projects`: Central wedding coordination projects
9. `wedding_requirements`: Customer submitted requirement specifications
10. `vendor_availability`: Slot management preventing double booking (`AVAILABLE`, `BOOKED`, `UNAVAILABLE`, `RESERVED`)
11. `vendor_requests`: Planner $\rightarrow$ Vendor requests (`PENDING`, `ACCEPTED`, `DECLINED` with reasons)
12. `bookings`: Wedding booking state machine (`DRAFT` to `COMPLETED`)
13. `booking_services`: Vendor services confirmed in bookings
14. `payments`: Milestone payments (Advance, Second, Final)
15. `payment_transactions`: Transaction logs (UPI, Card, Netbanking)
16. `invoices`: Invoice records with billing details
17. `budgets`: Live wedding financial tracking
18. `budget_items`: Itemized cost breakdowns per category
19. `wedding_schedule`: Day-of itinerary events & assigned vendors
20. `documents`: Contracts, floor plans, and mood boards
21. `conversations`: Chat sessions (Planner $\leftrightarrow$ Customer, Planner $\leftrightarrow$ Vendor)
22. `messages`: Real-time/polling messages with read receipts
23. `notifications`: Database-backed notification alerts
24. `reviews`: Customer reviews and vendor responses
25. `wishlists`: Customer saved inspirations
26. `support_requests`: User support ticketing system
27. `chatbot_conversations`: Assistant sessions
28. `chatbot_messages`: Contextual role-bounded assistant logs

## 3. How to Initialize & Seed the Database

### Option A: Automatic Setup (Recommended)
Make sure your `.env` in the `backend/` folder has your correct `DB_PASSWORD`. Then run from the `backend/` folder:
```bash
npm run db:setup
```
This script will automatically:
1. Connect to your MySQL server.
2. Create `wedding_planner` database if it doesn't already exist.
3. Import `database/schema.sql`.
4. Import `database/seed.sql`.

### Option B: Manual Import via MySQL CLI
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS wedding_planner CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p wedding_planner < database/schema.sql
mysql -u root -p wedding_planner < database/seed.sql
```

## 4. Default Sample Logins
All accounts use password: **`password123`**

| Role | Email | Name / Business | Description |
| :--- | :--- | :--- | :--- |
| **Planner** | `planner@wedding.com` | Priya Sharma | Lead Wedding Coordinator |
| **Planner** | `arjun.planner@wedding.com` | Arjun Kapoor | Senior Destination Planner |
| **Vendor** | `shutter@wedding.com` | Vikram Rathore | Shutter & Soul Studios (Photo) |
| **Vendor** | `floral@wedding.com` | Ananya Roy | Bloom & Blossom Decors |
| **Vendor** | `grandpalace@wedding.com` | Sanjay Singhania | The Grand Royal Palace (Venue) |
| **Vendor** | `royalcatering@wedding.com` | Chef Rajesh Nair | Royal Feast Caterers |
| **Vendor** | `glamour@wedding.com` | Kavita Menon | Glamour Studio Makeup |
| **Vendor** | `djbeats@wedding.com` | DJ Rohit Roy | Pulse & Beats Sound & DJ |
| **Customer** | `rahul.anita@gmail.com` | Rahul Verma | Active wedding with payments |
| **Customer** | `rohit.sneha@gmail.com` | Rohit Kulkarni | Confirmed wedding with DJ |
| **Customer** | `siddharth.pooja@gmail.com` | Siddharth Hegde | Customer Approval pending |
