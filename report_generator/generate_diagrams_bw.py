"""
Script to generate all architectural, UML, ER, and low-level system design diagrams
in 100% BLACK AND WHITE / GRAYSCALE for the Wedding Planner and Vendor Coordination Platform (WPVCP).

STRICT RULES:
- Zero color: Only #FFFFFF (white), #000000 (black), and pure grays (#F8F8F8, #EEEEEE, #E0E0E0, #CCCCCC, #333333).
- Ample canvas and box sizes so NO text ever overlaps or truncates.
- Crisp solid black borders, clean connectors, clear arrows, professional academic aesthetic.
"""

import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches

OUTPUT_DIR = r"c:\Users\Welcome\Downloads\WPVCP Modified\report_generator\figures_bw"
os.makedirs(OUTPUT_DIR, exist_ok=True)

plt.rcParams['font.sans-serif'] = 'DejaVu Sans'
plt.rcParams['axes.edgecolor'] = '#000000'

def save_fig(fig, filename):
    filepath = os.path.join(OUTPUT_DIR, filename)
    plt.tight_layout()
    plt.savefig(filepath, dpi=250, bbox_inches='tight', facecolor='#ffffff')
    plt.close(fig)
    print(f"Saved BW: {filename}")

def draw_box(ax, x, y, w, h, title, subtitle="", items=None, fc="#ffffff", ec="#000000", lw=1.4, radius=0.06):
    box = patches.FancyBboxPatch((x, y), w, h, boxstyle=f"round,pad={radius}", ec=ec, fc=fc, lw=lw, zorder=2)
    ax.add_patch(box)
    
    # Title
    t_y = y + h - 0.25 if subtitle or items else y + h/2
    ax.text(x + w/2, t_y, title, ha="center", va="center", fontsize=9.0, fontweight="bold", color="#000000", zorder=3)
    
    cur_y = t_y - 0.22
    if subtitle:
        ax.text(x + w/2, cur_y, subtitle, ha="center", va="center", fontsize=7.2, style="italic", color="#333333", zorder=3)
        cur_y -= 0.18
        
    if items:
        # Divider line
        ax.plot([x + 0.1, x + w - 0.1], [cur_y + 0.08, cur_y + 0.08], color="#000000", lw=0.8, zorder=3)
        for item in items:
            ax.text(x + 0.15, cur_y, item, ha="left", va="center", fontsize=6.8, color="#000000", zorder=3)
            cur_y -= 0.17

def draw_arrow(ax, x1, y1, x2, y2, label="", ls="-", lw=1.4, connectionstyle="arc3,rad=0"):
    arrow = patches.FancyArrowPatch(
        (x1, y1), (x2, y2),
        arrowstyle="-|>",
        mutation_scale=11,
        color="#000000",
        lw=lw,
        ls=ls,
        connectionstyle=connectionstyle,
        zorder=1
    )
    ax.add_patch(arrow)
    if label:
        mx, my = (x1 + x2)/2, (y1 + y2)/2
        ax.text(mx, my + 0.1, label, ha="center", va="bottom", fontsize=6.8, color="#000000", fontweight="bold",
                bbox=dict(boxstyle="square,pad=0.15", fc="#ffffff", ec="#000000", lw=0.6, alpha=0.95), zorder=4)

# -------------------------------------------------------------
# 1. FIG 4: UML CLASS DIAGRAM (BLACK & WHITE)
# -------------------------------------------------------------
def gen_class_diagram():
    fig, ax = plt.subplots(figsize=(14, 10.5))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 10.5)
    ax.axis("off")
    ax.set_title("Figure 4: Core Entity UML Class Diagram (WPVCP Domain Model)", fontsize=12, fontweight="bold", pad=15, color="#000000")

    draw_box(ax, 0.5, 7.6, 2.7, 2.3, "User", "<<Entity>>", 
             ["+ id: int [PK]", "+ email: string [UQ]", "+ role_id: int [FK]", "+ full_name: string", "+ auth_provider: enum", "+ is_active: boolean", "+ verifyPassword()"],
             fc="#ffffff", ec="#000000")

    draw_box(ax, 0.5, 4.4, 2.7, 2.1, "Planner", "<<Role Profile>>",
             ["+ id: int [PK]", "+ user_id: int [FK]", "+ agency_name: string", "+ experience_years: int", "+ contact_phone: string", "+ dispatchVendorReq()"],
             fc="#ffffff", ec="#000000")

    draw_box(ax, 0.5, 1.2, 2.7, 2.1, "Customer", "<<Role Profile>>",
             ["+ id: int [PK]", "+ user_id: int [FK]", "+ partner_name: string", "+ wedding_city: string", "+ target_budget: decimal", "+ submitRequirements()"],
             fc="#ffffff", ec="#000000")

    draw_box(ax, 4.0, 7.6, 2.9, 2.3, "WeddingProject", "<<Aggregate Root>>",
             ["+ id: int [PK]", "+ customer_id: int [FK]", "+ planner_id: int [FK]", "+ wedding_name: string", "+ wedding_date: date", "+ total_budget: decimal", "+ status: enum"],
             fc="#f5f5f5", ec="#000000")

    draw_box(ax, 4.0, 4.4, 2.9, 2.3, "WeddingRequirement", "<<Value Entity>>",
             ["+ id: int [PK]", "+ project_id: int [FK]", "+ customer_id: int [FK]", "+ guest_count: int", "+ theme: string", "+ est_budget: decimal", "+ catering_pref: string"],
             fc="#ffffff", ec="#000000")

    draw_box(ax, 4.0, 1.2, 2.9, 2.3, "VendorRequest", "<<Workflow State>>",
             ["+ id: int [PK]", "+ project_id: int [FK]", "+ vendor_id: int [FK]", "+ planner_id: int [FK]", "+ status: enum", "+ proposed_quote: decimal", "+ decline_reason: string"],
             fc="#ffffff", ec="#000000")

    draw_box(ax, 7.8, 7.6, 2.8, 2.3, "Booking", "<<Contract>>",
             ["+ id: int [PK]", "+ project_id: int [FK]", "+ customer_id: int [FK]", "+ planner_id: int [FK]", "+ total_amount: decimal", "+ status: enum", "+ payment_status: enum"],
             fc="#f5f5f5", ec="#000000")

    draw_box(ax, 7.8, 4.4, 2.8, 2.3, "BookingService", "<<Line Item>>",
             ["+ id: int [PK]", "+ booking_id: int [FK]", "+ vendor_id: int [FK]", "+ service_id: int [FK]", "+ agreed_price: decimal", "+ status: enum", "+ lockSlot()"],
             fc="#ffffff", ec="#000000")

    draw_box(ax, 7.8, 1.2, 2.8, 2.3, "Vendor", "<<Service Provider>>",
             ["+ id: int [PK]", "+ user_id: int [FK]", "+ category_id: int [FK]", "+ business_name: string", "+ city: string", "+ rating: decimal", "+ blockDate()"],
             fc="#ffffff", ec="#000000")

    draw_box(ax, 11.2, 7.6, 2.4, 2.3, "Payment", "<<Financial>>",
             ["+ id: int [PK]", "+ booking_id: int [FK]", "+ milestone_name: enum", "+ percentage: decimal", "+ amount: decimal", "+ status: enum", "+ markAsPaid()"],
             fc="#ffffff", ec="#000000")

    draw_box(ax, 11.2, 4.4, 2.4, 2.3, "Invoice", "<<Tax Document>>",
             ["+ id: int [PK]", "+ booking_id: int [FK]", "+ invoice_number: str", "+ subtotal: decimal", "+ tax_amount: decimal", "+ total_amount: decimal", "+ generatePDF()"],
             fc="#ffffff", ec="#000000")

    draw_box(ax, 11.2, 1.2, 2.4, 2.3, "WeddingSchedule", "<<Timeline>>",
             ["+ id: int [PK]", "+ project_id: int [FK]", "+ ceremony_name: str", "+ event_date: date", "+ start_time: time", "+ venue: string", "+ notifyGuests()"],
             fc="#ffffff", ec="#000000")

    # Connectors
    draw_arrow(ax, 1.85, 7.6, 1.85, 6.5, "1:1")
    draw_arrow(ax, 1.85, 4.4, 1.85, 3.3, "1:1")
    draw_arrow(ax, 3.2, 8.7, 4.0, 8.7, "1:N")
    draw_arrow(ax, 5.45, 7.6, 5.45, 6.7, "1:1")
    draw_arrow(ax, 5.45, 4.4, 5.45, 3.5, "1:N")
    draw_arrow(ax, 6.9, 8.7, 7.8, 8.7, "1:1")
    draw_arrow(ax, 9.2, 7.6, 9.2, 6.7, "1:N")
    draw_arrow(ax, 9.2, 4.4, 9.2, 3.5, "N:1")
    draw_arrow(ax, 10.6, 8.7, 11.2, 8.7, "1:3")
    draw_arrow(ax, 9.2, 8.4, 11.2, 5.5, "1:N", connectionstyle="arc3,rad=-0.15")
    draw_arrow(ax, 6.9, 8.0, 11.2, 2.3, "1:N", connectionstyle="arc3,rad=-0.2")

    save_fig(fig, "fig_4_class_diagram.png")

# -------------------------------------------------------------
# 2. FIG 6: RELATIONAL ER DIAGRAM (BLACK & WHITE)
# -------------------------------------------------------------
def gen_er_diagram():
    fig, ax = plt.subplots(figsize=(14, 10.5))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 10.5)
    ax.axis("off")
    ax.set_title("Figure 6: Entity-Relationship Diagram (28 Normalized MySQL Tables)", fontsize=12, fontweight="bold", pad=15, color="#000000")

    # Center Aggregate: wedding_projects
    draw_box(ax, 5.5, 6.6, 3.0, 2.5, "wedding_projects", "[Central Operational Pivot]",
             ["PK  id INT", "FK  customer_id INT", "FK  planner_id INT", "    wedding_name VARCHAR", "    wedding_date DATE", "    total_budget DECIMAL", "    status ENUM"],
             fc="#f5f5f5", ec="#000000")

    # Left: Users & Roles
    draw_box(ax, 0.4, 7.4, 2.3, 2.0, "roles", "[Auth Roles]",
             ["PK  id INT", "    name ENUM (4 roles)", "    description VARCHAR"],
             fc="#ffffff", ec="#000000")

    draw_box(ax, 0.4, 4.0, 2.3, 2.5, "users", "[Global Identity]",
             ["PK  id INT", "FK  role_id INT", "    email VARCHAR(191) UQ", "    password_hash VARCHAR", "    auth_provider ENUM", "    is_active BOOLEAN"],
             fc="#ffffff", ec="#000000")

    draw_box(ax, 3.1, 7.9, 2.0, 1.8, "planners", "[Profile]",
             ["PK  id INT", "FK  user_id INT UQ", "    agency_name VARCHAR", "    experience_years INT"],
             fc="#ffffff", ec="#000000")

    draw_box(ax, 3.1, 5.0, 2.0, 2.1, "customers", "[Profile]",
             ["PK  id INT", "FK  user_id INT UQ", "FK  planner_id INT", "    partner_name VARCHAR", "    target_budget DECIMAL"],
             fc="#ffffff", ec="#000000")

    draw_box(ax, 3.1, 1.8, 2.0, 2.3, "vendors", "[Profile]",
             ["PK  id INT", "FK  user_id INT UQ", "FK  category_id INT", "    business_name VARCHAR", "    city VARCHAR", "    rating DECIMAL"],
             fc="#ffffff", ec="#000000")

    draw_box(ax, 0.4, 1.2, 2.3, 1.8, "service_categories", "[Taxonomy]",
             ["PK  id INT", "    name VARCHAR UQ", "    slug VARCHAR UQ"],
             fc="#ffffff", ec="#000000")

    # Right: Operations & Bookings
    draw_box(ax, 9.0, 7.6, 2.3, 2.1, "wedding_requirements", "[Intake]",
             ["PK  id INT", "FK  project_id INT", "FK  customer_id INT", "    guest_count INT", "    theme VARCHAR"],
             fc="#ffffff", ec="#000000")

    draw_box(ax, 9.0, 4.8, 2.3, 2.3, "bookings", "[Escrow Contract]",
             ["PK  id INT", "FK  wedding_project_id INT", "FK  customer_id INT", "FK  planner_id INT", "    total_amount DECIMAL", "    status ENUM"],
             fc="#f5f5f5", ec="#000000")

    draw_box(ax, 11.6, 4.8, 2.1, 2.3, "booking_services", "[Line Items]",
             ["PK  id INT", "FK  booking_id INT", "FK  vendor_id INT", "FK  service_id INT", "    agreed_price DECIMAL"],
             fc="#ffffff", ec="#000000")

    draw_box(ax, 9.0, 1.8, 2.3, 2.4, "payments", "[25/50/25 Ledger]",
             ["PK  id INT", "FK  booking_id INT", "FK  customer_id INT", "    milestone_name ENUM", "    amount DECIMAL", "    status ENUM"],
             fc="#ffffff", ec="#000000")

    draw_box(ax, 11.6, 1.8, 2.1, 2.3, "invoices", "[Tax Invoice]",
             ["PK  id INT", "FK  booking_id INT", "FK  payment_id INT", "    invoice_number VARCHAR", "    tax_amount DECIMAL"],
             fc="#ffffff", ec="#000000")

    # Bottom Utility Tables
    draw_box(ax, 5.5, 3.6, 3.0, 2.3, "vendor_requests", "[Dispatch Hub]",
             ["PK  id INT", "FK  wedding_project_id INT", "FK  vendor_id INT", "FK  planner_id INT", "    status ENUM (ACCEPTED/DECLINED)", "    decline_reason TEXT"],
             fc="#ffffff", ec="#000000")

    draw_box(ax, 5.5, 0.8, 3.0, 2.1, "wedding_schedule", "[Timeline Run-of-Show]",
             ["PK  id INT", "FK  wedding_project_id INT", "FK  vendor_id INT", "    ceremony_name VARCHAR", "    event_date DATE", "    start_time TIME"],
             fc="#ffffff", ec="#000000")

    # Connectors
    draw_arrow(ax, 1.5, 7.4, 1.5, 6.5, "1:N")
    draw_arrow(ax, 2.7, 5.2, 3.1, 6.0, "1:1")
    draw_arrow(ax, 2.7, 4.5, 3.1, 8.4, "1:1")
    draw_arrow(ax, 2.7, 4.2, 3.1, 2.9, "1:1")
    draw_arrow(ax, 2.7, 2.0, 3.1, 2.2, "1:N")
    draw_arrow(ax, 4.1, 7.9, 5.5, 7.9, "1:N")
    draw_arrow(ax, 5.1, 6.0, 5.5, 7.3, "1:N")
    draw_arrow(ax, 8.5, 8.2, 9.0, 8.2, "1:1")
    draw_arrow(ax, 7.0, 6.6, 7.0, 5.9, "1:N")
    draw_arrow(ax, 5.1, 2.9, 5.5, 4.4, "1:N")
    draw_arrow(ax, 8.5, 7.0, 9.0, 6.0, "1:1")
    draw_arrow(ax, 10.1, 4.8, 11.6, 5.8, "1:N")
    draw_arrow(ax, 10.1, 4.8, 10.1, 4.2, "1:3")
    draw_arrow(ax, 11.3, 2.9, 11.6, 2.9, "1:1")
    draw_arrow(ax, 7.0, 3.6, 7.0, 2.9, "ref")

    save_fig(fig, "fig_6_er_diagram.png")

# -------------------------------------------------------------
# 3. FIG 7: MULTI-TIER SYSTEM ARCHITECTURE (BW)
# -------------------------------------------------------------
def gen_architecture_diagram():
    fig, ax = plt.subplots(figsize=(13, 8))
    ax.set_xlim(0, 13)
    ax.set_ylim(0, 8)
    ax.axis("off")
    ax.set_title("Figure 7.2: Layered MVC & Secure Request-Response Pipeline", fontsize=12, fontweight="bold", pad=15, color="#000000")

    draw_box(ax, 0.5, 1.0, 3.2, 6.2, "PRESENTATION TIER", "(React 18 SPA / Vite)",
             ["* React Router DOM v6", "* AuthContext & Role Guards", "* Axios Client + JWT Interceptors", "* ThemeContext (Light/Dark)", "* LanguageContext (6 Languages)", "* Dynamic Font Scale (S/M/L/XL)", "* Lucide Icon Library", "* Vanilla CSS Design Tokens"],
             fc="#ffffff", ec="#000000")

    draw_box(ax, 4.2, 4.3, 3.8, 2.9, "SECURITY & GATEWAY", "(Express Middleware Pipeline)",
             ["* express-rate-limit (100 req/15min)", "* CORS Policy Enforcement", "* Helmet Security Headers", "* Google OAuth 2.0 Token Validator", "* JWT Bearer Authentication", "* Role-Based Access Control (RBAC)"],
             fc="#f5f5f5", ec="#000000")

    draw_box(ax, 4.2, 1.0, 3.8, 2.9, "BUSINESS LOGIC TIER", "(Controllers & Domain Services)",
             ["* 20 REST Controllers (Booking, Vendor...)", "* Notification Engine (In-App Alerts)", "* AI Concierge Query Parser", "* GST Invoice & Tax Calculator", "* Multer File Upload Handler", "* Centralized Error Handling"],
             fc="#ffffff", ec="#000000")

    draw_box(ax, 8.5, 1.0, 4.0, 6.2, "DATA PERSISTENCE TIER", "(MySQL 8.0 Enterprise Relational DB)",
             ["* mysql2/promise Connection Pool", "* 28 Third-Normal-Form Tables", "* Foreign Key Referential Cascades", "* Atomic Multi-Table Transactions", "* Composite Indexes on Filter Keys", "* Character Set utf8mb4_unicode_ci", "* Parameterized SQL Statements", "* Strict Audit Timestamps"],
             fc="#ffffff", ec="#000000")

    draw_arrow(ax, 3.7, 5.6, 4.2, 5.6, "HTTP + Bearer")
    draw_arrow(ax, 6.1, 4.3, 6.1, 3.9, "Authorized")
    draw_arrow(ax, 8.0, 2.5, 8.5, 2.5, "Pool Query")
    draw_arrow(ax, 8.5, 2.0, 8.0, 2.0, "Result Set")
    draw_arrow(ax, 4.2, 2.2, 3.7, 2.2, "JSON Payload")

    save_fig(fig, "fig_7_architecture.png")

# -------------------------------------------------------------
# 4. FIG 8.0: OVERALL REQUEST DELEGATION FLOW (BW)
# -------------------------------------------------------------
def gen_request_flow_diagram():
    fig, ax = plt.subplots(figsize=(14, 7))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 7)
    ax.axis("off")
    ax.set_title("Figure 8.0: Enterprise Delegation Protocol (Customer -> Planner -> Vendor -> Planner -> Customer)", fontsize=12, fontweight="bold", pad=15, color="#000000")

    steps = [
        (0.6, 4.2, "1. Intake", "Customer submits wedding vision,\ndate, guest count & budget"),
        (3.3, 4.2, "2. Curation", "Planner reviews intake &\nchecks vendor availability"),
        (6.0, 4.2, "3. Dispatch", "Planner sends booking request\nwith offered quote to Vendor"),
        (8.7, 4.2, "4. Evaluation", "Vendor ACCEPTS (locks slot)\nor DECLINES with reason"),
        (11.4, 4.2, "5. Proposal", "Planner bundles vendors into\ncohesive proposal package"),
        (11.4, 1.2, "6. Approval", "Customer reviews & confirms\nproposal or requests changes"),
        (8.7, 1.2, "7. Advance 25%", "Customer pays 25% retainer;\nGST invoice auto-generated"),
        (6.0, 1.2, "8. Execution", "Day-of-wedding ceremony timeline\n& vendor coordination"),
        (3.3, 1.2, "9. Final 75%", "Mid-term (50%) & Final (25%)\npayments released to vendors"),
        (0.6, 1.2, "10. Review", "Verified customer submits\nvendor ratings & testimonials"),
    ]

    for x, y, title, desc in steps:
        draw_box(ax, x, y, 2.2, 1.9, title, "", desc.split("\n"), fc="#ffffff", ec="#000000")

    draw_arrow(ax, 2.8, 5.15, 3.3, 5.15, "", lw=1.8)
    draw_arrow(ax, 5.5, 5.15, 6.0, 5.15, "", lw=1.8)
    draw_arrow(ax, 8.2, 5.15, 8.7, 5.15, "", lw=1.8)
    draw_arrow(ax, 10.9, 5.15, 11.4, 5.15, "", lw=1.8)
    draw_arrow(ax, 12.5, 4.2, 12.5, 3.1, "", lw=1.8)
    draw_arrow(ax, 11.4, 2.15, 10.9, 2.15, "", lw=1.8)
    draw_arrow(ax, 8.7, 2.15, 8.2, 2.15, "", lw=1.8)
    draw_arrow(ax, 6.0, 2.15, 5.5, 2.15, "", lw=1.8)
    draw_arrow(ax, 3.3, 2.15, 2.8, 2.15, "", lw=1.8)

    save_fig(fig, "fig_8_0_request_flow.png")

# -------------------------------------------------------------
# 5. FIG 8.1: PROJECT DIRECTORY STRUCTURE (BW)
# -------------------------------------------------------------
def gen_directory_diagram():
    fig, ax = plt.subplots(figsize=(13, 8))
    ax.set_xlim(0, 13)
    ax.set_ylim(0, 8)
    ax.axis("off")
    ax.set_title("Figure 8.1.1: Full-Stack Project Folder Hierarchy & Component Tree", fontsize=12, fontweight="bold", pad=15, color="#000000")

    draw_box(ax, 0.5, 4.6, 3.6, 2.9, "database/", "[MySQL Schema & Seeds]",
             ["* schema.sql (28 normalized tables)", "* seed.sql (Realistic test accounts)", "* README.md (DB setup guide)", "* Indices on FKs & Filter columns"],
             fc="#ffffff", ec="#000000")

    draw_box(ax, 4.6, 4.2, 3.8, 3.3, "backend/", "[Node / Express Server]",
             ["* server.js (Entry point & routes)", "* config/ (db.js connection pool)", "* controllers/ (20 REST controllers)", "* middleware/ (auth, rateLimit, role)", "* routes/ (20 Express routers)", "* services/ (notifications, chatbot)", "* utils/ (formatters, queryHelper)"],
             fc="#f5f5f5", ec="#000000")

    draw_box(ax, 8.9, 0.8, 3.6, 6.7, "frontend/src/", "[Vite + React SPA]",
             ["* main.jsx (Bootstrap & Providers)", "* App.jsx (Route definitions & guards)", "* components/ (Navbar, Sidebar, Modal...)", "* context/ (Auth, Theme, Lang, Toast)", "* layouts/ (DashboardLayout.jsx)", "* pages/auth/ (Login, Register, OAuth)", "* pages/planner/ (12 planner pages)", "* pages/vendor/ (11 vendor pages)", "* pages/customer/ (12 customer pages)", "* pages/common/ (Messages, Reports...)", "* styles/ (index.css design tokens)"],
             fc="#ffffff", ec="#000000")

    draw_box(ax, 0.5, 0.8, 3.6, 3.4, "backend/controllers/", "[Dedicated REST Handlers]",
             ["* authController.js (Local & OAuth)", "* bookingController.js (Escrow status)", "* vendorController.js (Profiles & slots)", "* budgetController.js (Ledger sync)", "* invoiceController.js (GST calculations)", "* messageController.js (Discussions)", "* reportController.js (Dynamic exports)"],
             fc="#ffffff", ec="#000000")

    draw_box(ax, 4.6, 0.8, 3.8, 3.0, "frontend/src/context/", "[Global Reactive State]",
             ["* AuthContext (Token & Role profile)", "* ThemeContext (Light & Dark mode)", "* LanguageContext (6 Indian languages)", "* ToastContext (Transient alerts)", "* RecentlyAccessed (Fast history)"],
             fc="#ffffff", ec="#000000")

    draw_arrow(ax, 4.1, 6.0, 4.6, 6.0, "Imports DDL")
    draw_arrow(ax, 8.4, 5.8, 8.9, 5.8, "Consumes APIs")

    save_fig(fig, "fig_8_1_1_project_tree.png")

# -------------------------------------------------------------
# 6. MODULE ARCHITECTURE DIAGRAMS (BW)
# -------------------------------------------------------------
def gen_module_architecture_diagrams():
    modules = [
        ("fig_8_2_a_auth_arch.png", "Figure 8.2.A: Low-Level Architecture – User Authentication & Role Access Control",
         [("Browser Client", "React Auth Form / Google Login", 0.5, 2.8),
          ("API Gateway", "rateLimitMiddleware (15m limit)\n/api/auth router", 3.8, 2.8),
          ("Auth Controller", "bcrypt.compare() /\nGoogle OAuth Client token verify", 7.1, 2.8),
          ("MySQL DB", "users & roles tables\nReturns user_id, role, JWT", 10.4, 2.8)]),

        ("fig_8_3_a_req_arch.png", "Figure 8.3.A: Low-Level Architecture – Wedding Requirements & Intake",
         [("Customer View", "CustomerRequirements.jsx\nForm inputs: date, city, budget", 0.5, 2.8),
          ("Express Route", "/api/requirements\nauthMiddleware & verifyRole(CUSTOMER)", 3.8, 2.8),
          ("Project Service", "Creates wedding_projects entry &\nassociates wedding_requirements", 7.1, 2.8),
          ("MySQL Engine", "Inserts into wedding_projects &\nnotifies assigned Planner", 10.4, 2.8)]),

        ("fig_8_4_a_vendor_arch.png", "Figure 8.4.A: Low-Level Architecture – Vendor Catalog & Availability Engine",
         [("Vendor Portal", "VendorAvailabilityCalendar.jsx\nClick to toggle AVAILABLE/BLOCKED", 0.5, 2.8),
          ("Slot Controller", "/api/vendors/:id/availability\nValidates ISO Date & Role", 3.8, 2.8),
          ("Conflict Engine", "Checks existing bookings for date;\nPrevents double reservation", 7.1, 2.8),
          ("Availability Table", "vendor_availability upsert\nUpdates calendar UI state", 10.4, 2.8)]),

        ("fig_8_5_a_coord_arch.png", "Figure 8.5.A: Low-Level Architecture – Enterprise Coordination & Dispatch Workflow",
         [("Planner Hub", "VendorRequests.jsx\nSelects Vendor & dispatches inquiry", 0.5, 2.8),
          ("Dispatch API", "POST /api/vendor-requests\nStatus defaults to PENDING", 3.8, 2.8),
          ("Vendor Response", "PUT /api/vendor-requests/:id\nVendor ACCEPTS or DECLINES with note", 7.1, 2.8),
          ("Proposal Builder", "Locks slot into BookingService\nTriggers Customer Review state", 10.4, 2.8)]),

        ("fig_8_6_a_payment_arch.png", "Figure 8.6.A: Low-Level Architecture – Milestone Payments & Automated Invoicing",
         [("Customer View", "CustomerPayments.jsx\nAdvance (25%), Mid (50%), Final (25%)", 0.5, 2.8),
          ("Payment Route", "POST /api/payments/:id/pay\nValidates amount & milestone stage", 3.8, 2.8),
          ("Invoice Generator", "Computes 18% GST (CGST+SGST)\nGenerates unique INV-YYYY-SEQ", 7.1, 2.8),
          ("Ledger DB", "Updates payment_transactions &\nrefreshes budget actual spent", 10.4, 2.8)]),

        ("fig_8_7_a_schedule_arch.png", "Figure 8.7.A: Low-Level Architecture – Ceremony Itinerary & Document Vault",
         [("Planner / Couple", "WeddingSchedule.jsx\nTimetable, venues, assigned vendors", 0.5, 2.8),
          ("Schedule Router", "/api/schedule & /api/documents\nMulter file parser (PDF/PNG)", 3.8, 2.8),
          ("Event Sync", "Associates event timing with\nconfirmed vendor contacts", 7.1, 2.8),
          ("Document Storage", "uploads/docs/ directory &\ndocuments relational table", 10.4, 2.8)]),

        ("fig_8_8_a_messaging_arch.png", "Figure 8.8.A: Low-Level Architecture – Real-Time Messaging & AI Concierge",
         [("User Interface", "MessagesPage.jsx & Chatbot.jsx\nLive input drawer & query bubble", 0.5, 2.8),
          ("Message Gateway", "/api/messages & /api/chatbot\nSanitizes text & maps recipient", 3.8, 2.8),
          ("Concierge Engine", "Natural language keyword matcher\nQueries project status & vendors", 7.1, 2.8),
          ("Chat Persistence", "conversations & chatbot_messages\nUnread badges & timestamps", 10.4, 2.8)]),

        ("fig_8_9_a_analytics_arch.png", "Figure 8.9.A: Low-Level Architecture – Executive Dashboard & Business Analytics",
         [("Role Dashboard", "PlannerDashboard.jsx / ReportsPage.jsx\nKPI metric cards & charts", 0.5, 2.8),
          ("Analytics API", "GET /api/reports & /api/admin/stats\nDate & category query params", 3.8, 2.8),
          ("SQL Aggregator", "GROUP BY status, category, date\nSUM(amount) & COUNT(bookings)", 7.1, 2.8),
          ("Export Streamer", "Generates CSV / Print-ready ledger\nStreamed to browser client", 10.4, 2.8)])
    ]

    for fname, title, boxes in modules:
        fig, ax = plt.subplots(figsize=(13, 6))
        ax.set_xlim(0, 13)
        ax.set_ylim(0, 6)
        ax.axis("off")
        ax.set_title(title, fontsize=11, fontweight="bold", pad=15, color="#000000")

        for b_title, b_desc, x, y in boxes:
            draw_box(ax, x, y, 2.5, 2.4, b_title, "", b_desc.split("\n"), fc="#ffffff", ec="#000000")

        draw_arrow(ax, 3.0, 4.0, 3.8, 4.0, "Request", lw=1.5)
        draw_arrow(ax, 6.3, 4.0, 7.1, 4.0, "Delegate", lw=1.5)
        draw_arrow(ax, 9.6, 4.0, 10.4, 4.0, "Persist", lw=1.5)

        draw_arrow(ax, 10.4, 3.3, 9.6, 3.3, "Result", lw=1.2, ls="--")
        draw_arrow(ax, 7.1, 3.3, 6.3, 3.3, "Process", lw=1.2, ls="--")
        draw_arrow(ax, 3.8, 3.3, 3.0, 3.3, "JSON State", lw=1.2, ls="--")

        save_fig(fig, fname)

# -------------------------------------------------------------
# 7. UI MOCKUPS / WIREFRAME SCHEMATICS (100% BLACK & WHITE)
# -------------------------------------------------------------
def gen_ui_mockup_diagrams():
    uis = [
        ("fig_8_2_1_auth_ui.png", "Figure 8.2: User Authentication & Role Selection Interface",
         "Vows & Veils - Enterprise Access Gateway",
         [("Login Credentials", "Input: planner@wedding.com | password123"),
          ("Dual-Auth Support", "Standard Bcrypt Hash Authentication + Official Google OAuth 2.0 Button"),
          ("Active Role Routing", "Auto-redirects to /planner/dashboard, /vendor/dashboard, or /customer/dashboard"),
          ("Security Guard", "express-rate-limit 15 req/15min active with failed attempt throttling")]),

        ("fig_8_3_1_req_ui.png", "Figure 8.3: Customer Wedding Requirements & Intake Submission Interface",
         "Couple Onboarding - Requirements Specification",
         [("Couple Information", "Names: Rahul & Anita Verma | City: Bangalore | Wedding Date: 2026-11-20"),
          ("Scope & Budget", "Estimated Guests: 450 | Total Ceiling Budget: INR 25,00,000"),
          ("Service Preferences", "Mandatory categories: Venue Decor, Multi-Cuisine Banquets, Drone Photography, Sangeet DJ"),
          ("Planner Assignment", "Assigned Lead Concierge: Priya Sharma (Elite Wedding Planners)")]),

        ("fig_8_4_1_vendor_ui.png", "Figure 8.4: Vendor Availability Calendar & Real-Time Slot Reservation Interface",
         "Pixel & Petals Photography - Availability Manager",
         [("Monthly Calendar Grid", "November 2026: Solid Box = AVAILABLE, Pattern Box = BOOKED, Open Box = BLOCKED"),
          ("Interactive Date Toggling", "One-click status toggle with automatic date conflict prevention"),
          ("Service Packages", "Package 1: Candid Pre-Wedding | Package 2: 3-Day Royal Wedding & Drone Coverage"),
          ("Booking Direct Link", "Dates locked by confirmed Planner Proposals cannot be double-booked")]),

        ("fig_8_5_1_coord_ui.png", "Figure 8.5: Planner Coordination & Vendor Request Dispatch Interface",
         "Proposal Builder - Vendor Dispatch & Negotiation Center",
         [("Dispatched Requests", "4 Requests Dispatched: Shutter (Photography), Royal Mandap (Decor), Annapoorna (Catering), DJ Beats"),
          ("Vendor Responses", "3 ACCEPTED (Rates Locked) | 1 DECLINED with Reason (Alternative Selected in 1 click)"),
          ("Unified Proposal Card", "Total Proposed Package: INR 18,50,000 (Within Couple's INR 25,00,000 Budget)"),
          ("Client Approval State", "Status: PROPOSAL_APPROVED by Couple | Triggering Milestone Payment Schedules")]),

        ("fig_8_6_1_payment_ui.png", "Figure 8.6: Milestone Payments & Automated GST Tax Invoicing Interface",
         "Financial Ledger & Milestone Payment Schedules",
         [("Milestone 1 (25% Advance)", "Amount: INR 4,62,500 | Status: PAID (Transaction Ref: TXN-2026-9812) | Invoice: INV-2026-001"),
          ("Milestone 2 (50% Mid-Term)", "Amount: INR 9,25,000 | Status: PENDING (Due 15 days prior to ceremony)"),
          ("Milestone 3 (25% Final)", "Amount: INR 4,62,500 | Status: PENDING (Released upon wedding completion)"),
          ("GST Invoice Breakdown", "Taxable Subtotal: INR 3,91,949 | CGST (9%): INR 35,275 | SGST (9%): INR 35,275 | Total: INR 4,62,500")]),

        ("fig_8_7_1_schedule_ui.png", "Figure 8.7: Run-of-Show Ceremony Itinerary & Digital Document Hub Interface",
         "Wedding Day Timeline & Document Vault",
         [("Mehndi & Sangeet", "Date: 2026-11-19 | 17:00 - 22:00 | Venue: Crystal Lawn | Assigned: DJ Rohit Roy"),
          ("Traditional Muhurtham", "Date: 2026-11-20 | 06:30 - 09:30 | Venue: Main Mandap | Assigned: Shutter Photography"),
          ("Grand Reception", "Date: 2026-11-20 | 19:00 - 23:00 | Venue: Grand Ballroom | Assigned: Royal Catering"),
          ("Document Vault", "Uploaded: Mandap Blueprint (PDF), Food Safety Certificate (PDF), Vendor Contract (Signed)")]),

        ("fig_8_8_1_messaging_ui.png", "Figure 8.8: Multi-Role Messaging & Contextual AI Concierge Chatbot Interface",
         "Real-Time Collaboration Center & AI Concierge",
         [("Active Conversation", "Planner (Priya Sharma) <-> Couple (Rahul & Anita): 'Floral stage mockups uploaded for your review.'"),
          ("AI Concierge Bubble", "Couples ask: 'What is our remaining budget?' -> AI replies: 'You have INR 6,50,000 remaining unallocated.'"),
          ("Unread Badge Counter", "Header badge alerts user of 3 new unread incoming messages and booking status updates"),
          ("Role Guard Privacy", "Vendors cannot view Customer direct budget or other vendors' contracted pricing")]),

        ("fig_8_9_1_analytics_ui.png", "Figure 8.9: Executive Analytics Dashboard & KPI Reporting Interface",
         "Executive Command Dashboard & Performance Metrics",
         [("Key Metric Counters", "Active Weddings: 5 | Confirmed Bookings: 12 | Dispatched Vendors: 28 | Invoiced: INR 42,80,000"),
          ("Category Spend Chart", "Banquets & Catering (42%) | Decor & Mandap (24%) | Photography (18%) | Music & DJ (16%)"),
          ("Vendor Acceptance Rate", "88.9% Acceptance Rate | Average Vendor Response Latency: 2.4 Hours"),
          ("Dynamic Report Exporter", "One-click export to CSV / Excel and formatted PDF printable accounting summaries")])
    ]

    for fname, title, header_text, cards in uis:
        fig, ax = plt.subplots(figsize=(13, 7.5))
        ax.set_xlim(0, 13)
        ax.set_ylim(0, 7.5)
        ax.axis("off")
        ax.set_title(title, fontsize=11, fontweight="bold", pad=15, color="#000000")

        # Outer Browser Frame (Pure BW)
        frame = patches.FancyBboxPatch((0.5, 0.5), 12.0, 6.2, boxstyle="round,pad=0.1", ec="#000000", fc="#ffffff", lw=1.8)
        ax.add_patch(frame)

        # Header Bar (Dark charcoal / black fill with white text)
        hbar = patches.Rectangle((0.5, 5.8), 12.0, 0.9, fc="#000000", ec="#000000")
        ax.add_patch(hbar)
        ax.text(0.9, 6.25, f"WPVCP Suite - {header_text}", fontsize=10.5, fontweight="bold", color="#ffffff", va="center")
        ax.text(12.0, 6.25, "Status: LIVE (MySQL Connected)", fontsize=8, color="#ffffff", ha="right", va="center")

        # Window controls dots (grayscale)
        for idx, col in enumerate(["#ffffff", "#cccccc", "#888888"]):
            circle = patches.Circle((0.8 + idx*0.25, 6.45), 0.07, fc=col, ec="#ffffff" if col != "#ffffff" else "#000000", lw=0.6)
            ax.add_patch(circle)

        # 4 content cards (Black & white layout)
        coords = [(0.8, 3.3, 5.6, 2.2), (6.6, 3.3, 5.6, 2.2), (0.8, 0.8, 5.6, 2.2), (6.6, 0.8, 5.6, 2.2)]
        for (c_title, c_desc), (cx, cy, cw, ch) in zip(cards, coords):
            card_patch = patches.FancyBboxPatch((cx, cy), cw, ch, boxstyle="round,pad=0.08", ec="#000000", fc="#ffffff", lw=1.2)
            ax.add_patch(card_patch)
            ax.text(cx + 0.2, cy + ch - 0.35, c_title, fontsize=9.0, fontweight="bold", color="#000000")
            ax.plot([cx + 0.2, cx + cw - 0.2], [cy + ch - 0.5, cy + ch - 0.5], color="#000000", lw=0.6)
            
            # Text wrapping
            words = c_desc.split(" ")
            lines = []
            cur_line = []
            for w in words:
                cur_line.append(w)
                if len(" ".join(cur_line)) > 42:
                    lines.append(" ".join(cur_line))
                    cur_line = []
            if cur_line:
                lines.append(" ".join(cur_line))
                
            l_y = cy + ch - 0.75
            for line in lines:
                ax.text(cx + 0.2, l_y, line, fontsize=7.8, color="#000000")
                l_y -= 0.25

        save_fig(fig, fname)

if __name__ == "__main__":
    print("Generating all 21 Black and White architectural diagrams...")
    gen_class_diagram()
    gen_er_diagram()
    gen_architecture_diagram()
    gen_request_flow_diagram()
    gen_directory_diagram()
    gen_module_architecture_diagrams()
    gen_ui_mockup_diagrams()
    print("All 21 BW diagrams generated successfully!")
