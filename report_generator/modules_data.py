modules_data = [
    {
        "id": "8.2",
        "title": "USER AUTHENTICATION & ROLE-BASED ACCESS CONTROL",
        "purpose": "Provides dual-channel authentication (Local Bcrypt + Google OAuth 2.0) and enforces strict Role-Based Access Control (RBAC) across ADMIN, PLANNER, VENDOR, and CUSTOMER roles.",
        "func_reqs": [
            "User Registration: Register new customer and vendor accounts with salted bcrypt password hashing.",
            "Local Login: Authenticate existing users using email and password, issuing 7-day stateless JWT bearer tokens.",
            "Google OAuth 2.0: One-click authentication with official Google Identity Services (prompt=select_account) without exposing Gmail credentials.",
            "Token Verification: Authenticate incoming API requests via Bearer tokens in the HTTP Authorization header.",
            "Role Authorization: Enforce strict role-based route guards blocking unauthorized cross-role API invocations.",
            "Rate Limiting: Restrict failed authentication attempts to 15 requests per 15 minutes to thwart brute-force attacks.",
            "Session State: Return authenticated user profile (id, email, full_name, role, avatar_url) for client state hydration."
        ],
        "non_func_reqs": [
            "Security: Passwords hashed using bcryptjs with a work factor of 10; zero cleartext storage.",
            "Token Expiration: JWT tokens expire after 7 days; tokens contain user ID and role claims signed with HMAC-SHA256.",
            "Authentication Latency: Local credential validation completes in under 120 ms; OAuth verification under 250 ms.",
            "High Concurrency: Stateless JWT verification eliminates database session lookups on protected routes."
        ],
        "tech_stack": [
            ["Password Hashing", "bcryptjs", "Pure JavaScript salted cryptographic hashing; eliminates native OS build tool dependencies."],
            ["Token Engine", "jsonwebtoken (JWT)", "Stateless, digitally signed bearer tokens containing role claims for instant middleware validation."],
            ["OAuth Provider", "google-auth-library", "Official Google SDK validating ID tokens and retrieving verified user email and full name."],
            ["Rate Limiting", "express-rate-limit", "In-memory request counter throttling abusive requests on /api/auth routes."]
        ],
        "sizing": [
            ["Total Registered Users", "~ 1,300 users", "50 Planners, 250 Vendors, 1,000 Customers."],
            ["Logins per Day", "~ 1,500 logins", "Average 1.15 logins per user daily."],
            ["Peak Login Burst", "~ 15 logins / minute", "Morning operational window (9:00 AM - 10:00 AM)."],
            ["Users Table Storage", "~ 650 KB", "1,300 rows × ~500 bytes per row."]
        ],
        "arch_fig": "fig_8_2_a_auth_arch.png",
        "arch_caption": "Figure 8.2.A: Low-Level Architecture - USER AUTHENTICATION & ACCESS CONTROL",
        "request_flow": [
            "User submits login form on React client or clicks 'Continue with Google'.",
            "Request passes through express-rate-limit; rejected with HTTP 429 if threshold exceeded.",
            "authController verifies credentials against MySQL users table using bcrypt.compare() or validates Google token.",
            "On success, backend signs JWT token with secret and returns token + user profile payload.",
            "React client stores token in localStorage and AuthContext dispatches user to appropriate dashboard (/planner, /vendor, /customer)."
        ],
        "api_table": [
            ["POST", "/api/auth/login", "Public", "Authenticates user via email and password; returns JWT token and user profile."],
            ["POST", "/api/auth/register", "Public", "Registers new CUSTOMER or VENDOR account with role_id assignment."],
            ["GET", "/api/auth/me", "Authenticated", "Returns current authenticated user profile decoded from JWT token."],
            ["GET", "/api/auth/google/url", "Public", "Returns official Google OAuth consent screen authorization redirect URL."],
            ["POST", "/api/auth/google/callback", "Public", "Exchanges OAuth code for Google tokens, verifies profile, and returns JWT."]
        ],
        "db_table": [
            ["roles", "PK id, UNIQUE name", "Defines the 4 privilege tiers: ADMIN, PLANNER, VENDOR, CUSTOMER."],
            ["users", "PK id, FK role_id, UNIQUE email, UNIQUE google_id", "email, password_hash, full_name, phone, auth_provider, is_active."]
        ],
        "ui_fig": "fig_8_2_1_auth_ui.png",
        "ui_caption": "Figure 8.2: User Authentication & Role Selection Interface",
        "ui_desc": "The authentication interface presents a modern card layout featuring email/password input fields, password visibility toggles, dynamic validation feedback, and an official 'Continue with Google' button. Upon successful authentication, users are automatically directed to their role-specific dashboard."
    },
    {
        "id": "8.3",
        "title": "WEDDING REQUIREMENTS & CUSTOMER ONBOARDING",
        "purpose": "Digitizes the client intake process, capturing the couple's wedding vision, ceremony dates, guest counts, and budgetary limits, and binds the customer to an assigned Wedding Planner.",
        "func_reqs": [
            "Customer Profile Setup: Captures partner name, wedding destination city, and primary contact information.",
            "Requirements Intake: Collects guest count, target ceremony date, aesthetic theme, and catering preferences.",
            "Ceiling Budget Capture: Sets total target budget to prevent over-allocation during vendor dispatch.",
            "Project Instantiation: Automatically creates a wedding_projects record linked to the customer and planner.",
            "Planner Assignment: Associates the project with a certified planner based on agency availability.",
            "Requirement Editing: Allows couples to update requirements prior to proposal finalization.",
            "Status Tracking: Reflects current onboarding state: INTAKE_PENDING, PROPOSAL_DRAFTING, or CONFIRMED."
        ],
        "non_func_reqs": [
            "Validation: Strict schema validation on numeric guest counts (positive integer) and budgets (> 0).",
            "Data Integrity: Foreign key constraints prevent orphaned requirement sheets if a project is purged.",
            "Response Latency: Requirement submission and project instantiation completes in under 100 ms.",
            "Usability: Step-by-step guided wizard interface with contextual help cards."
        ],
        "tech_stack": [
            ["Form Handling", "React Controlled Inputs", "Real-time state validation, dirty field tracking, and dynamic input formatting."],
            ["Data Access", "MySQL Parameterized INSERTs", "Atomic insertion into wedding_projects and wedding_requirements tables."],
            ["Notifications", "notificationService.js", "Dispatches instant in-app alert to assigned planner when new intake arrives."]
        ],
        "sizing": [
            ["Annual Requirement Sheets", "~ 500 records / year", "One sheet per contracted wedding."],
            ["Average Data Size / Sheet", "~ 1.5 KB", "Textual preferences, theme strings, and numeric parameters."],
            ["Storage Demands", "~ 750 KB / year", "Negligible footprint in MySQL relational storage."]
        ],
        "arch_fig": "fig_8_3_a_req_arch.png",
        "arch_caption": "Figure 8.3.A: Low-Level Architecture - WEDDING REQUIREMENTS & CUSTOMER ONBOARDING",
        "request_flow": [
            "Customer completes intake wizard in CustomerRequirements.jsx and clicks 'Submit Requirements'.",
            "Axios dispatches POST /api/requirements with Bearer token and intake payload.",
            "authMiddleware validates JWT; roleMiddleware confirms user possesses CUSTOMER role.",
            "requirementController begins SQL transaction: creates wedding_projects row, then creates wedding_requirements row.",
            "notificationService dispatches alert to assigned planner; JSON response confirms project activation."
        ],
        "api_table": [
            ["POST", "/api/requirements", "Customer Only", "Submits intake sheet and instantiates corresponding wedding project."],
            ["GET", "/api/requirements/my-requirements", "Customer / Planner", "Retrieves active requirement specifications for current project."],
            ["PUT", "/api/requirements/:id", "Customer / Planner", "Updates guest counts, date, theme, or budget allocations."],
            ["GET", "/api/projects/my-project", "Customer / Planner", "Returns aggregate project status, dates, and assigned concierge details."]
        ],
        "db_table": [
            ["wedding_projects", "PK id, FK customer_id, FK planner_id", "wedding_name, wedding_date, total_budget, status."],
            ["wedding_requirements", "PK id, FK wedding_project_id, FK customer_id", "guest_count, theme, preferred_destinations, catering_preferences."]
        ],
        "ui_fig": "fig_8_3_1_req_ui.png",
        "ui_caption": "Figure 8.3: Customer Wedding Requirements & Intake Submission Interface",
        "ui_desc": "The intake interface provides couples with an intuitive, multi-section questionnaire capturing ceremony date, destination, guest numbers, aesthetic themes, and budget constraints, coupled with live feedback confirming lead planner assignment."
    },
    {
        "id": "8.4",
        "title": "VENDOR SERVICE CATALOG & AVAILABILITY ENGINE",
        "purpose": "Enables verified wedding vendors to publish service catalogs, manage tiered packages, and maintain a dynamic, date-locking availability calendar to eliminate double bookings.",
        "func_reqs": [
            "Service Package Management: Create, edit, and categorize service packages with descriptions, durations, and rates.",
            "Availability Calendar Grid: Monthly visual calendar rendering dates as AVAILABLE, BOOKED, or BLOCKED.",
            "One-Click Date Toggling: Allows vendors to block personal dates or open availability in one click.",
            "Automated Slot Locking: Confirmed planner bookings automatically update date status to 'BOOKED' with project link.",
            "Category Taxonomy Filtering: Filter vendor catalogs by service categories (Decor, Catering, Photo, DJ, Makeup).",
            "City-Based Search: Look up vendors by operational cities to match customer destination criteria.",
            "Vendor Profile Management: Maintain business credentials, portfolio imagery, experience years, and contact info."
        ],
        "non_func_reqs": [
            "Consistency: Composite unique constraint on vendor_availability(vendor_id, date) prevents conflicting records.",
            "Fast Query Latency: Calendar month availability fetch completes in under 45 ms via indexed date lookups.",
            "Concurrency Protection: Concurrent date locking attempts handled safely via row-level database locking.",
            "Visual Clarity: Color-coded calendar days (Green = Available, Red = Booked, Gray = Blocked)."
        ],
        "tech_stack": [
            ["Calendar UI", "Custom React Grid", "Zero-dependency CSS grid rendering monthly date blocks with click-to-toggle logic."],
            ["Data Access", "MySQL UPSERT Queries", "INSERT INTO vendor_availability ... ON DUPLICATE KEY UPDATE status=VALUES(status)."],
            ["Taxonomy Engine", "service_categories Master", "Normalized relational taxonomy enabling indexed filtering by category slug."]
        ],
        "sizing": [
            ["Registered Vendors", "~ 250 vendors", "Active service partners across 6 regional metros."],
            ["Calendar Rows per Year", "~ 91,250 rows / year", "250 vendors × 365 days."],
            ["Calendar Table Storage", "~ 12 MB / year", "Compact schema (~130 bytes per row with indexes)."]
        ],
        "arch_fig": "fig_8_4_a_vendor_arch.png",
        "arch_caption": "Figure 8.4.A: Low-Level Architecture - VENDOR SERVICE CATALOG & AVAILABILITY ENGINE",
        "request_flow": [
            "Vendor navigates to VendorAvailabilityCalendar.jsx; React dispatches GET /api/vendors/:id/availability?month=YYYY-MM.",
            "vendorController executes indexed query against vendor_availability; returns month slot array.",
            "Vendor clicks a date cell to toggle state; client dispatches POST /api/vendors/:id/availability/toggle.",
            "Backend verifies slot is not locked by an active booking; executes upsert and returns updated date state."
        ],
        "api_table": [
            ["GET", "/api/vendors", "Authenticated", "Lists verified vendors with search, category filtering, city filtering, and paging."],
            ["GET", "/api/vendors/:id", "Authenticated", "Returns comprehensive vendor profile, published services, and ratings."],
            ["GET", "/api/vendors/:id/availability", "Authenticated", "Fetches calendar slot statuses for a specified year and month."],
            ["POST", "/api/vendors/:id/availability/toggle", "Vendor Only", "Toggles slot status between AVAILABLE and BLOCKED for a date."],
            ["POST", "/api/vendors/:id/services", "Vendor Only", "Creates new service package with title, price, duration, and inclusions."]
        ],
        "db_table": [
            ["vendors", "PK id, FK user_id, FK category_id", "business_name, city, base_price, rating, bio."],
            ["vendor_services", "PK id, FK vendor_id", "service_name, price, duration_hours, description."],
            ["vendor_availability", "PK id, FK vendor_id, UNIQUE(vendor_id, date)", "date, status (AVAILABLE, BOOKED, BLOCKED), notes."]
        ],
        "ui_fig": "fig_8_4_1_vendor_ui.png",
        "ui_caption": "Figure 8.4: Vendor Availability Calendar & Slot Manager Interface",
        "ui_desc": "The vendor calendar screen provides an interactive monthly matrix displaying color-coded reservation states, allowing vendors to manage slot commitments with one click while inspecting confirmed wedding engagements."
    },
    {
        "id": "8.5",
        "title": "ENTERPRISE COORDINATION WORKFLOW & DISPATCH ENGINE",
        "purpose": "Governs the core five-phase delegation protocol (Customer -> Planner -> Vendor -> Planner -> Customer), managing request dispatches, vendor quote negotiations, proposal assembly, and client approvals.",
        "func_reqs": [
            "Vendor Inquiry Dispatch: Planner explores availability and dispatches booking inquiries with offered quotes.",
            "Vendor Decision Portal: Vendor inspects request details and either ACCEPTS or DECLINES with mandatory notes.",
            "Alternative Vendor Routing: If declined, planner receives instant notification and selects alternative vendor in 1 click.",
            "Unified Proposal Assembly: Planner bundles accepted vendors across all categories into a comprehensive proposal.",
            "Client Proposal Inspection: Couple reviews itemized proposal, vendor credentials, contracted rates, and grand total.",
            "Client Approval Workflow: Customer approves proposal or submits revision requests with detailed feedback.",
            "Escrow Booking Instantiation: Approval transitions project to formal Booking, locking all vendor slots permanently."
        ],
        "non_func_reqs": [
            "Workflow Strictness: State transitions enforced via finite state machine; invalid transitions rejected.",
            "Atomic Commitment: Conversion of proposal to booking executes inside a multi-table database transaction.",
            "Audit Trail: Every dispatch, response, acceptance, and decline note is permanently logged with timestamps.",
            "Response Speed: Proposal compilation and contract generation executes in under 200 ms."
        ],
        "tech_stack": [
            ["Transaction Engine", "MySQL BEGIN ... COMMIT", "Guarantees that bookings, booking_services, and milestone payments commit atomically."],
            ["Notification Dispatch", "notificationService.js", "Multi-role dispatching notifying couples, planners, and vendors at each transition."],
            ["Workflow UI", "SelectedVendors.jsx & CustomerRequests.jsx", "Kanban and table views of active dispatch requests and approval stages."]
        ],
        "sizing": [
            ["Inquiry Dispatches / Year", "~ 3,500 dispatches", "Average 7 vendor dispatches per wedding project."],
            ["Vendor Acceptance Rate", "~ 88 % acceptance", "High acceptance driven by prior real-time availability checks."],
            ["Active Proposals / Month", "~ 45 proposals", "Active in negotiation and client review."],
            ["Workflow Storage", "~ 4.5 MB / year", "vendor_requests and bookings relational logs."]
        ],
        "arch_fig": "fig_8_5_a_coord_arch.png",
        "arch_caption": "Figure 8.5.A: Low-Level Architecture - ENTERPRISE COORDINATION WORKFLOW & DISPATCH",
        "request_flow": [
            "Planner selects vendor in VendorDirectory.jsx and dispatches inquiry (POST /api/vendor-requests).",
            "Vendor receives alert, opens VendorBookingRequests.jsx, and clicks Accept (PUT /api/vendor-requests/:id).",
            "Planner reviews accepted vendors and compiles unified proposal in SelectedVendors.jsx.",
            "Customer opens CustomerVendorSelection.jsx, reviews itemized package, and clicks 'Approve Proposal'.",
            "bookingController runs atomic transaction: creates booking, creates booking_services, locks dates to BOOKED, and instantiates 3 milestone payments."
        ],
        "api_table": [
            ["POST", "/api/vendor-requests", "Planner Only", "Dispatches booking inquiry to vendor with offered quote and date."],
            ["PUT", "/api/vendor-requests/:id", "Vendor Only", "Records vendor response: ACCEPTED or DECLINED with mandatory note."],
            ["GET", "/api/vendor-requests/project/:id", "Planner / Customer", "Lists all dispatched inquiries and current status for a wedding."],
            ["POST", "/api/bookings/create-from-proposal", "Planner / Customer", "Converts accepted proposal into binding booking and locks slots."],
            ["PUT", "/api/bookings/:id/approve", "Customer Only", "Customer confirms proposal, triggering milestone payment schedules."]
        ],
        "db_table": [
            ["vendor_requests", "PK id, FK wedding_project_id, FK vendor_id, FK planner_id", "proposed_quote, status (PENDING, ACCEPTED, DECLINED), decline_reason."],
            ["bookings", "PK id, FK wedding_project_id, FK customer_id, FK planner_id", "total_amount, status (DRAFT, PROPOSED, CONFIRMED, COMPLETED)."],
            ["booking_services", "PK id, FK booking_id, FK vendor_id, FK service_id", "agreed_price, status, contracted_at."]
        ],
        "ui_fig": "fig_8_5_1_coord_ui.png",
        "ui_caption": "Figure 8.5: Planner Coordination & Vendor Request Dispatch Interface",
        "ui_desc": "The proposal builder displays the status of all dispatched vendor requests, highlighting accepted partner quotes, decline reasons with instant replacement selectors, and client review confirmation toggles."
    },
    {
        "id": "8.6",
        "title": "MILESTONE PAYMENTS, INVOICES & ESCROW BUDGET LEDGER",
        "purpose": "Manages the financial lifecycle of the wedding through structured 25%/50%/25% milestone installments, automated 18% GST invoice generation, and real-time budget synchronization.",
        "func_reqs": [
            "Milestone Schedule Generation: Automatically partitions total booking value into 25% Advance, 50% Mid-Term, and 25% Final installments.",
            "Payment Processing & Recording: Records milestone disbursements with transaction references and payment methods.",
            "Automated GST Tax Invoicing: Calculates 18% GST (9% CGST + 9% SGST) and assigns sequential invoice numbers (INV-YYYY-SEQ).",
            "Synchronized Budget Tracking: Reconciles allocated vs actual spent amounts against ceiling budgets across categories.",
            "Invoice PDF Generation & Print: Formats print-ready commercial tax invoices with issuer/recipient details.",
            "Financial Ledger Reporting: Exports comprehensive accounting summaries to CSV and formatted tables.",
            "Escrow Status Indicators: Displays payment states: PENDING, DUE, PAID, or REFUNDED with audit logs."
        ],
        "non_func_reqs": [
            "Arithmetic Precision: All financial amounts stored using MySQL DECIMAL(12,2) to eliminate floating-point rounding errors.",
            "Idempotency: Payment processing endpoints enforce idempotency to prevent duplicate transaction postings.",
            "Tax Compliance: Adheres to Indian Goods & Services Tax (GST) invoicing standards with dual CGST/SGST splits.",
            "Invoice Generation Latency: Tax invoice calculations and sequence assignment complete in under 50 ms."
        ],
        "tech_stack": [
            ["Monetary Engine", "MySQL DECIMAL(12,2)", "Guarantees exact arithmetic for taxes, line items, and milestone disbursements."],
            ["PDF Rendering", "Browser Print CSS / Window.print()", "Formatted tax invoice vouchers styled with high-contrast print stylesheets."],
            ["Ledger Sync", "budgetController.js", "Executes aggregate SQL SUM queries to refresh category actuals upon payment."]
        ],
        "sizing": [
            ["Milestone Payments / Year", "~ 1,500 records / year", "3 installments per contracted wedding."],
            ["Invoices Generated / Year", "~ 1,500 tax invoices", "One formal tax invoice per recorded payment milestone."],
            ["Annual Financial Volume", "~ INR 90,00,00,000", "500 weddings × average INR 18,00,000 contract value."],
            ["Ledger Storage", "~ 3.2 MB / year", "payments, payment_transactions, and invoices records."]
        ],
        "arch_fig": "fig_8_6_a_payment_arch.png",
        "arch_caption": "Figure 8.6.A: Low-Level Architecture - MILESTONE PAYMENTS & INVOICES",
        "request_flow": [
            "Customer views CustomerPayments.jsx showing 3 milestone cards; clicks 'Pay Milestone'.",
            "Axios dispatches POST /api/payments/:id/pay with payment method and reference.",
            "paymentController verifies payment is due; records row in payment_transactions; updates payment status to PAID.",
            "Backend automatically calculates 18% GST, generates invoice sequence number, and inserts into invoices table.",
            "budgetController updates budget_items actual spent; customer receives confirmation and downloadable tax invoice."
        ],
        "api_table": [
            ["GET", "/api/payments/booking/:id", "Authenticated", "Returns 3 milestone schedules, amounts, due dates, and payment statuses."],
            ["POST", "/api/payments/:id/pay", "Customer / Planner", "Executes milestone disbursement and triggers invoice creation."],
            ["GET", "/api/invoices/:id", "Authenticated", "Retrieves complete tax invoice details including subtotal, CGST, SGST, and total."],
            ["GET", "/api/budgets/project/:id", "Customer / Planner", "Returns categorized budget summary: target vs allocated vs actual spent."]
        ],
        "db_table": [
            ["payments", "PK id, FK booking_id, FK customer_id", "milestone_name (ADVANCE_25, MID_TERM_50, FINAL_25), amount, status."],
            ["payment_transactions", "PK id, FK payment_id", "transaction_ref, payment_method, amount_paid, transaction_date."],
            ["invoices", "PK id, FK booking_id, FK payment_id", "invoice_number, subtotal, tax_amount, total_amount, status."]
        ],
        "ui_fig": "fig_8_6_1_payment_ui.png",
        "ui_caption": "Figure 8.6: Milestone Payments & Automated GST Tax Invoicing Interface",
        "ui_desc": "The payment management view renders milestone installment cards detailing percentage splits, amounts, due dates, payment status badges, transaction references, and interactive buttons to view and print official GST tax invoices."
    },
    {
        "id": "8.7",
        "title": "CEREMONY ITINERARY, EVENT SCHEDULING & DOCUMENT VAULT",
        "purpose": "Coordinates down-to-the-minute day-of-wedding ceremony timelines, links venues with confirmed vendor contacts, and maintains a secure digital document repository for contracts and blueprints.",
        "func_reqs": [
            "Ceremony Run-of-Show Timetable: Organizes multi-day wedding events (Haldi, Sangeet, Muhurtham, Reception).",
            "Timestamp & Venue Mapping: Records event dates, exact start/end hours, venue addresses, and dress codes.",
            "Vendor Contact Binding: Associates confirmed vendor partners to specific ceremony milestones for day-of coordination.",
            "Document Vault Uploads: Uploads vendor contracts, venue blueprints, safety permits, and dietary schedules.",
            "MIME-Type & Size Validation: Validates uploaded files (PDF, JPEG, PNG, max 10 MB) to maintain storage security.",
            "Secure File Retrieval: Provides role-protected download links for authenticated wedding participants.",
            "Event Timeline Export: Generates printable chronological itineraries for couple family members and vendors."
        ],
        "non_func_reqs": [
            "File Security: Uploads stored outside web root with randomized hash filenames to prevent path traversal.",
            "Availability: Timetable accessible offline or via fast cached views on mobile devices during ceremony execution.",
            "File Handling Latency: Multipart upload processing and metadata indexing completes in under 300 ms.",
            "Chronological Sorting: Events automatically sorted by date and start_time via SQL ORDER BY clauses."
        ],
        "tech_stack": [
            ["Upload Engine", "Multer Middleware", "Multipart form-data parsing with disk storage engine and filename hashing."],
            ["Validation", "FileFilter Functions", "Restricts file extensions to .pdf, .jpg, .jpeg, .png; rejects malicious binaries."],
            ["Chronological UI", "WeddingSchedule.jsx", "Timeline component rendering chronological cards with venue and contact tags."]
        ],
        "sizing": [
            ["Schedule Items / Wedding", "~ 5 - 8 ceremonies", "Multi-day Indian wedding celebration structure."],
            ["Annual Schedule Entries", "~ 3,500 schedule rows", "500 weddings × average 7 ceremony milestones."],
            ["Uploaded Documents / Wedding", "~ 4 documents", "Signed contracts, venue layouts, insurance certificates."],
            ["Document File Storage", "~ 20 GB / year", "2,000 files × average 10 MB file size ceiling."]
        ],
        "arch_fig": "fig_8_7_a_schedule_arch.png",
        "arch_caption": "Figure 8.7.A: Low-Level Architecture - CEREMONY ITINERARY & DOCUMENT VAULT",
        "request_flow": [
            "Planner adds ceremony milestone in WeddingSchedule.jsx; Axios posts to POST /api/schedule.",
            "scheduleController validates date and timestamps; inserts row into wedding_schedule table.",
            "User uploads contract PDF via ContractsDocuments.jsx; Multer middleware processes multipart data.",
            "File is saved to uploads/docs/ with secure hash; documentController inserts metadata into documents table.",
            "Participants view chronological timetable and access document download links."
        ],
        "api_table": [
            ["GET", "/api/schedule/project/:id", "Authenticated", "Retrieves complete chronological ceremony timeline for a wedding."],
            ["POST", "/api/schedule", "Planner Only", "Adds new ceremony event with title, date, start/end time, venue, and vendor."],
            ["DELETE", "/api/schedule/:id", "Planner Only", "Removes ceremony milestone from project run-of-show schedule."],
            ["POST", "/api/documents/upload", "Authenticated", "Uploads document file using Multer; returns stored file metadata."],
            ["GET", "/api/documents/project/:id", "Authenticated", "Lists all uploaded contracts, blueprints, and permits for a wedding."]
        ],
        "db_table": [
            ["wedding_schedule", "PK id, FK wedding_project_id, FK vendor_id", "ceremony_name, event_date, start_time, end_time, venue, notes."],
            ["documents", "PK id, FK wedding_project_id, FK uploader_id", "file_name, file_path, file_type, file_size, document_type."]
        ],
        "ui_fig": "fig_8_7_1_schedule_ui.png",
        "ui_caption": "Figure 8.7: Run-of-Show Ceremony Itinerary & Digital Document Hub Interface",
        "ui_desc": "The schedule view displays a clean vertical timeline organizing multi-day wedding events with ceremony badges, start/end timestamps, venue locations, and assigned vendor points of contact, alongside document vault download controls."
    },
    {
        "id": "8.8",
        "title": "REAL-TIME MESSAGING, NOTIFICATIONS & CONTEXTUAL AI CONCIERGE",
        "purpose": "Provides internal multi-role messaging, automated workflow notifications, and a database-connected conversational AI assistant for instant wedding query resolution.",
        "func_reqs": [
            "Direct Multi-Role Messaging: Facilitates private discussion threads between planners, couples, and vendors.",
            "Unread Message Counters: Displays real-time unread badges on the navigation bar alerting users to new inquiries.",
            "Workflow Notifications: Automatically dispatches in-app alerts when proposals arrive, quotes change, or payments become due.",
            "AI Concierge Chatbot: Natural language conversational assistant floating across all authenticated dashboard views.",
            "Contextual DB Querying: AI chatbot parses user intent and queries live database states regarding budget, dates, and vendors.",
            "Role Privacy Shield: Strict data isolation prevents vendors from viewing customer direct budgets or competing vendor rates.",
            "Notification Dismissal: Allows users to mark alerts as read individually or batch dismiss all notifications."
        ],
        "non_func_reqs": [
            "Low Message Latency: Message posting and persistence executes in under 80 ms via indexed conversation threads.",
            "AI Query Latency: Chatbot intent parsing and contextual database response generated in under 350 ms.",
            "Audit Integrity: Messages permanently preserved with sender, recipient, and millisecond-precision timestamps.",
            "Accessibility: Chatbot drawer fully keyboard-navigable and compatible with high-contrast screen reader modes."
        ],
        "tech_stack": [
            ["Chat Engine", "REST Polling & WebSockets Ready", "Low-latency message endpoints with conversation thread indexing."],
            ["Concierge NLP", "chatbotController.js", "Regular expression and keyword taxonomy parser matching database entities."],
            ["Notification Dispatcher", "notificationService.js", "Centralized event bus emitting database notification records upon workflow triggers."]
        ],
        "sizing": [
            ["Messages per Wedding", "~ 120 messages", "Discussions during proposal, timeline, and execution phases."],
            ["Annual Message Volume", "~ 60,000 messages / year", "500 weddings × 120 messages."],
            ["Chatbot Inquiries / Day", "~ 350 queries / day", "Couples checking budgets, schedules, and vendor contact info."],
            ["Chat Storage Footprint", "~ 18 MB / year", "messages, conversations, and chatbot_messages tables."]
        ],
        "arch_fig": "fig_8_8_a_messaging_arch.png",
        "arch_caption": "Figure 8.8.A: Low-Level Architecture - REAL-TIME MESSAGING & AI CONCIERGE",
        "request_flow": [
            "User enters text into Chatbot.jsx drawer; client posts to POST /api/chatbot/message.",
            "chatbotController normalizes query, extracts entities (e.g. 'budget', 'schedule', 'caterer'), and queries MySQL.",
            "Concierge compiles contextual natural language response and records message in chatbot_messages table.",
            "When planner sends message to couple (POST /api/messages), backend saves text and triggers notificationService.",
            "Recipient's header badge counter increments; clicking badge opens conversation thread with auto-scroll."
        ],
        "api_table": [
            ["GET", "/api/messages/conversations", "Authenticated", "Lists active discussion threads with participant avatars and unread counts."],
            ["GET", "/api/messages/:conversationId", "Authenticated", "Fetches chronological message history for a specific thread."],
            ["POST", "/api/messages", "Authenticated", "Sends text message to recipient; updates conversation updated_at marker."],
            ["GET", "/api/notifications", "Authenticated", "Returns unread notifications and alerts for current authenticated user."],
            ["POST", "/api/chatbot/message", "Authenticated", "Processes user natural language query and returns contextual database answer."]
        ],
        "db_table": [
            ["conversations", "PK id, FK participant_one_id, FK participant_two_id, FK wedding_project_id", "last_message_at, status."],
            ["messages", "PK id, FK conversation_id, FK sender_id, FK recipient_id", "content, is_read, created_at."],
            ["notifications", "PK id, FK user_id", "title, message, type (PROPOSAL, PAYMENT, VENDOR, SYSTEM), is_read."],
            ["chatbot_conversations", "PK id, FK user_id", "session_token, created_at."],
            ["chatbot_messages", "PK id, FK conversation_id", "sender_type (USER, BOT), query_text, response_text."]
        ],
        "ui_fig": "fig_8_8_1_messaging_ui.png",
        "ui_caption": "Figure 8.8: Multi-Role Messaging & Contextual AI Concierge Chatbot Interface",
        "ui_desc": "The communication center displays two-column discussion threads with participant avatars, message bubble styling, and unread badges, alongside the floating AI concierge drawer providing instant answers to database inquiries."
    },
    {
        "id": "8.9",
        "title": "EXECUTIVE ANALYTICS DASHBOARD & BUSINESS INTELLIGENCE",
        "purpose": "Consolidates operational metrics across weddings, vendor performance, budget allocations, and payment collections into interactive executive dashboards with exportable reports.",
        "func_reqs": [
            "Operational KPI Summary Cards: Displays active wedding counts, confirmed bookings, dispatched requests, and revenue.",
            "Category Spend Distribution: Renders proportional expenditure charts across Catering, Decor, Photography, and Music.",
            "Vendor Performance Metrics: Computes vendor acceptance rates, average response latency, and customer rating scores.",
            "Cash Flow & Milestone Ledger: Tracks total invoiced sums, collected milestone advances, and pending receivables.",
            "Dynamic Filter Controls: Filter reports by date ranges, wedding destination cities, and specific planners.",
            "Tabular Data Grid: Renders sortable, paginated data tables with multi-column filtering.",
            "Export Engine: One-click export of financial ledgers and vendor performance registers to CSV and printable sheets."
        ],
        "non_func_reqs": [
            "Query Optimization: Metric aggregation uses SQL GROUP BY and SUM/COUNT functions; zero heavy client-side loops.",
            "Dashboard Load Time: Executive dashboard metrics load completely in under 180 ms via indexed aggregate queries.",
            "Export Streaming: CSV generation streams output directly to HTTP response avoiding server memory spikes.",
            "Responsiveness: Dashboards adapt dynamically from multi-column desktop displays to single-column mobile views."
        ],
        "tech_stack": [
            ["Aggregation Engine", "MySQL GROUP BY Queries", "Executes high-speed server-side aggregation for KPI cards and distributions."],
            ["Data Visualization", "CSS Metric Cards & StatBars", "Lightweight, responsive progress indicators and proportional category bars."],
            ["Exporter", "Native CSV Formatter", "Fast streaming CSV serialization with standard RFC 4180 MIME headers."]
        ],
        "sizing": [
            ["Dashboard Views / Day", "~ 450 dashboard loads", "Planners and executives monitoring morning and evening operations."],
            ["Aggregation Queries / Load", "~ 4 aggregate queries", "KPI counts, category spend sums, milestone receivables, recent activity."],
            ["Annual Purchase Summary", "~ 4,000 ledger rows", "Consolidated across all 500 annual wedding production cycles."],
            ["Report Storage Footprint", "Read-Only Layer", "Generates dynamic views from existing 28 relational tables without redundant tables."]
        ],
        "arch_fig": "fig_8_9_a_analytics_arch.png",
        "arch_caption": "Figure 8.9.A: Low-Level Architecture - EXECUTIVE ANALYTICS & REPORTING ENGINE",
        "request_flow": [
            "Planner opens PlannerDashboard.jsx; client dispatches GET /api/reports/summary and GET /api/reports/category-spend.",
            "reportController executes optimized SQL aggregate queries across wedding_projects, bookings, and payments.",
            "Aggregated metrics returned in single JSON payload; React updates KPI counters and progress bars.",
            "User clicks 'Export CSV'; backend streams formatted CSV file with Content-Disposition attachment headers."
        ],
        "api_table": [
            ["GET", "/api/reports/summary", "Planner / Admin", "Returns top-level KPI counters: active weddings, bookings, and revenue."],
            ["GET", "/api/reports/category-spend", "Planner / Admin", "Computes total expenditure grouped by service category."],
            ["GET", "/api/reports/vendor-performance", "Planner / Admin", "Returns acceptance rates and review scores per vendor."],
            ["GET", "/api/reports/export-csv", "Planner / Admin", "Generates and streams downloadable CSV export of the financial ledger."]
        ],
        "db_table": [
            ["Read-Only Aggregations", "N/A (Virtual Views)", "Executes GROUP BY and aggregate functions across bookings, payments, and vendors."],
            ["Underlying Tables", "wedding_projects, bookings, payments, vendors, reviews", "Indexed date and status columns drive high-speed report queries."]
        ],
        "ui_fig": "fig_8_9_1_analytics_ui.png",
        "ui_caption": "Figure 8.9: Executive Analytics Dashboard & KPI Reporting Interface",
        "ui_desc": "The executive command dashboard combines summary metric cards with proportional category expenditure bars, vendor response analytics, and dynamic tabular ledgers equipped with one-click CSV export controls."
    }
]

# Iterate through modules and build detailed documentation
