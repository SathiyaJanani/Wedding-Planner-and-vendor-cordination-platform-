"""
Script to generate all architectural, UML, ER, and low-level system design diagrams
for the Wedding Planner and Vendor Coordination Platform (WPVCP) Project Report.
"""
import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches

OUTPUT_DIR = r"c:\Users\Welcome\Downloads\WPVCP Modified\report_generator\figures"
os.makedirs(OUTPUT_DIR, exist_ok=True)

plt.rcParams['font.sans-serif'] = 'DejaVu Sans'
plt.rcParams['axes.edgecolor'] = '#94a3b8'

def save_fig(fig, filename):
    filepath = os.path.join(OUTPUT_DIR, filename)
    plt.tight_layout()
    plt.savefig(filepath, dpi=220, bbox_inches='tight', facecolor='#ffffff')
    plt.close(fig)
    print(f"Saved: {filename}")

def draw_box(ax, x, y, w, h, title, subtitle="", items=None, fc="#f8fafc", ec="#334155", title_color="#0f172a", radius=0.08):
    box = patches.FancyBboxPatch((x, y), w, h, boxstyle=f"round,pad={radius}", ec=ec, fc=fc, lw=1.5, zorder=2)
    ax.add_patch(box)
    
    # Title
    t_y = y + h - 0.25 if subtitle or items else y + h/2
    ax.text(x + w/2, t_y, title, ha="center", va="center", fontsize=9.5, fontweight="bold", color=title_color, zorder=3)
    
    cur_y = t_y - 0.22
    if subtitle:
        ax.text(x + w/2, cur_y, subtitle, ha="center", va="center", fontsize=7.5, style="italic", color="#475569", zorder=3)
        cur_y -= 0.2
        
    if items:
        # Divider line
        ax.plot([x + 0.1, x + w - 0.1], [cur_y + 0.08, cur_y + 0.08], color=ec, lw=0.8, alpha=0.5, zorder=3)
        for item in items:
            ax.text(x + 0.15, cur_y, item, ha="left", va="center", fontsize=7.0, color="#1e293b", zorder=3)
            cur_y -= 0.18

def draw_arrow(ax, x1, y1, x2, y2, label="", color="#475569", ls="-", lw=1.5, connectionstyle="arc3,rad=0"):
    arrow = patches.FancyArrowPatch(
        (x1, y1), (x2, y2),
        arrowstyle="-|>",
        mutation_scale=12,
        color=color,
        lw=lw,
        ls=ls,
        connectionstyle=connectionstyle,
        zorder=1
    )
    ax.add_patch(arrow)
    if label:
        mx, my = (x1 + x2)/2, (y1 + y2)/2
        ax.text(mx, my + 0.1, label, ha="center", va="bottom", fontsize=7.0, color=color, fontweight="bold",
                bbox=dict(boxstyle="square,pad=0.15", fc="#ffffff", ec="none", alpha=0.85), zorder=4)

# -------------------------------------------------------------
# 1. FIG 4: UML CLASS DIAGRAM
# -------------------------------------------------------------
def gen_class_diagram():
    fig, ax = plt.subplots(figsize=(14, 10))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 10)
    ax.axis("off")
    ax.set_title("Figure 4: Core Entity UML Class Diagram (WPVCP Domain Model)", fontsize=13, fontweight="bold", pad=15, color="#0f172a")

    # Classes
    draw_box(ax, 0.5, 7.2, 2.6, 2.2, "User", "<<Entity>>", 
             ["+ id: int [PK]", "+ email: string [UQ]", "+ role_id: int [FK]", "+ full_name: string", "+ auth_provider: enum", "+ is_active: boolean", "+ verifyPassword()"],
             fc="#eff6ff", ec="#2563eb", title_color="#1e40af")

    draw_box(ax, 0.5, 4.2, 2.6, 2.0, "Planner", "<<Role Profile>>",
             ["+ id: int [PK]", "+ user_id: int [FK]", "+ agency_name: string", "+ experience_years: int", "+ contact_phone: string", "+ dispatchVendorReq()"],
             fc="#f5f3ff", ec="#7c3aed", title_color="#5b21b6")

    draw_box(ax, 0.5, 1.2, 2.6, 2.0, "Customer", "<<Role Profile>>",
             ["+ id: int [PK]", "+ user_id: int [FK]", "+ partner_name: string", "+ wedding_city: string", "+ target_budget: decimal", "+ submitRequirements()"],
             fc="#ecfdf5", ec="#059669", title_color="#065f46")

    draw_box(ax, 4.0, 7.2, 2.8, 2.2, "WeddingProject", "<<Aggregate Root>>",
             ["+ id: int [PK]", "+ customer_id: int [FK]", "+ planner_id: int [FK]", "+ wedding_name: string", "+ wedding_date: date", "+ total_budget: decimal", "+ status: enum"],
             fc="#fff7ed", ec="#ea580c", title_color="#9a3412")

    draw_box(ax, 4.0, 4.2, 2.8, 2.2, "WeddingRequirement", "<<Value Entity>>",
             ["+ id: int [PK]", "+ project_id: int [FK]", "+ customer_id: int [FK]", "+ guest_count: int", "+ theme: string", "+ est_budget: decimal", "+ catering_pref: string"],
             fc="#fef2f2", ec="#dc2626", title_color="#991b1b")

    draw_box(ax, 4.0, 1.2, 2.8, 2.2, "VendorRequest", "<<Workflow State>>",
             ["+ id: int [PK]", "+ project_id: int [FK]", "+ vendor_id: int [FK]", "+ planner_id: int [FK]", "+ status: enum", "+ proposed_quote: decimal", "+ decline_reason: string"],
             fc="#fdf4ff", ec="#c026d3", title_color="#86198f")

    draw_box(ax, 7.8, 7.2, 2.8, 2.2, "Booking", "<<Contract>>",
             ["+ id: int [PK]", "+ project_id: int [FK]", "+ customer_id: int [FK]", "+ planner_id: int [FK]", "+ total_amount: decimal", "+ status: enum", "+ payment_status: enum"],
             fc="#f0fdf4", ec="#16a34a", title_color="#166534")

    draw_box(ax, 7.8, 4.2, 2.8, 2.2, "BookingService", "<<Line Item>>",
             ["+ id: int [PK]", "+ booking_id: int [FK]", "+ vendor_id: int [FK]", "+ service_id: int [FK]", "+ agreed_price: decimal", "+ status: enum", "+ lockSlot()"],
             fc="#f0fdfa", ec="#0d9488", title_color="#115e59")

    draw_box(ax, 7.8, 1.2, 2.8, 2.2, "Vendor", "<<Service Provider>>",
             ["+ id: int [PK]", "+ user_id: int [FK]", "+ category_id: int [FK]", "+ business_name: string", "+ city: string", "+ rating: decimal", "+ blockDate()"],
             fc="#f5f3ff", ec="#7c3aed", title_color="#5b21b6")

    draw_box(ax, 11.2, 7.2, 2.4, 2.2, "Payment", "<<Financial>>",
             ["+ id: int [PK]", "+ booking_id: int [FK]", "+ milestone_name: enum", "+ percentage: decimal", "+ amount: decimal", "+ status: enum", "+ markAsPaid()"],
             fc="#fefce8", ec="#ca8a04", title_color="#854d0e")

    draw_box(ax, 11.2, 4.2, 2.4, 2.2, "Invoice", "<<Legal Document>>",
             ["+ id: int [PK]", "+ booking_id: int [FK]", "+ invoice_number: str", "+ subtotal: decimal", "+ tax_amount: decimal", "+ total_amount: decimal", "+ generatePDF()"],
             fc="#fff1f2", ec="#e11d48", title_color="#9f1239")

    draw_box(ax, 11.2, 1.2, 2.4, 2.2, "WeddingSchedule", "<<Timeline>>",
             ["+ id: int [PK]", "+ project_id: int [FK]", "+ ceremony_name: str", "+ event_date: date", "+ start_time: time", "+ venue: string", "+ notifyGuests()"],
             fc="#f0f9ff", ec="#0284c7", title_color="#075985")

    # Connectors
    draw_arrow(ax, 1.8, 7.2, 1.8, 6.2, "1:1", color="#64748b")
    draw_arrow(ax, 1.8, 4.2, 1.8, 3.2, "1:1", color="#64748b")
    draw_arrow(ax, 3.1, 8.3, 4.0, 8.3, "1:N", color="#2563eb")
    draw_arrow(ax, 5.4, 7.2, 5.4, 6.4, "1:1", color="#ea580c")
    draw_arrow(ax, 5.4, 4.2, 5.4, 3.4, "1:N", color="#ea580c")
    draw_arrow(ax, 6.8, 8.3, 7.8, 8.3, "1:1", color="#16a34a")
    draw_arrow(ax, 9.2, 7.2, 9.2, 6.4, "1:N", color="#16a34a")
    draw_arrow(ax, 9.2, 4.2, 9.2, 3.4, "N:1", color="#0d9488")
    draw_arrow(ax, 10.6, 8.3, 11.2, 8.3, "1:3", color="#ca8a04")
    draw_arrow(ax, 9.2, 8.0, 11.2, 5.3, "1:N", color="#e11d48", connectionstyle="arc3,rad=-0.15")
    draw_arrow(ax, 6.8, 7.8, 11.2, 2.3, "1:N", color="#0284c7", connectionstyle="arc3,rad=-0.2")

    save_fig(fig, "fig_4_class_diagram.png")

# -------------------------------------------------------------
# 2. FIG 6: RELATIONAL ER DIAGRAM
# -------------------------------------------------------------
def gen_er_diagram():
    fig, ax = plt.subplots(figsize=(14, 10))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 10)
    ax.axis("off")
    ax.set_title("Figure 6: Entity-Relationship Diagram (28 Normalized MySQL Tables)", fontsize=13, fontweight="bold", pad=15, color="#0f172a")

    # Center Aggregate: wedding_projects
    draw_box(ax, 5.5, 6.2, 3.0, 2.4, "wedding_projects", "[Central Pivot]",
             ["PK  id INT", "FK  customer_id INT", "FK  planner_id INT", "    wedding_name VARCHAR", "    wedding_date DATE", "    total_budget DECIMAL", "    status ENUM"],
             fc="#fff7ed", ec="#ea580c", title_color="#9a3412")

    # Left: Users & Roles
    draw_box(ax, 0.4, 7.0, 2.3, 2.0, "roles", "[Auth Taxonomy]",
             ["PK  id INT", "    name ENUM (4 roles)", "    description VARCHAR"],
             fc="#f1f5f9", ec="#475569")

    draw_box(ax, 0.4, 3.8, 2.3, 2.4, "users", "[Global Identity]",
             ["PK  id INT", "FK  role_id INT", "    email VARCHAR(191) UQ", "    password_hash VARCHAR", "    auth_provider ENUM", "    is_active BOOLEAN"],
             fc="#eff6ff", ec="#2563eb", title_color="#1e40af")

    draw_box(ax, 3.1, 7.5, 2.0, 1.8, "planners", "[Profile]",
             ["PK  id INT", "FK  user_id INT UQ", "    agency_name VARCHAR", "    experience_years INT"],
             fc="#f5f3ff", ec="#7c3aed")

    draw_box(ax, 3.1, 4.8, 2.0, 2.0, "customers", "[Profile]",
             ["PK  id INT", "FK  user_id INT UQ", "FK  planner_id INT", "    partner_name VARCHAR", "    target_budget DECIMAL"],
             fc="#ecfdf5", ec="#059669")

    draw_box(ax, 3.1, 1.8, 2.0, 2.2, "vendors", "[Profile]",
             ["PK  id INT", "FK  user_id INT UQ", "FK  category_id INT", "    business_name VARCHAR", "    city VARCHAR", "    rating DECIMAL"],
             fc="#fdf4ff", ec="#c026d3")

    draw_box(ax, 0.4, 1.2, 2.3, 1.8, "service_categories", "[Taxonomy]",
             ["PK  id INT", "    name VARCHAR UQ", "    slug VARCHAR UQ"],
             fc="#f8fafc", ec="#64748b")

    # Right: Operations & Bookings
    draw_box(ax, 9.0, 7.2, 2.3, 2.0, "wedding_requirements", "[Intake]",
             ["PK  id INT", "FK  project_id INT", "FK  customer_id INT", "    guest_count INT", "    theme VARCHAR"],
             fc="#fef2f2", ec="#dc2626")

    draw_box(ax, 9.0, 4.6, 2.3, 2.2, "bookings", "[Escrow Agreement]",
             ["PK  id INT", "FK  wedding_project_id INT", "FK  customer_id INT", "FK  planner_id INT", "    total_amount DECIMAL", "    status ENUM"],
             fc="#f0fdf4", ec="#16a34a", title_color="#166534")

    draw_box(ax, 11.6, 4.6, 2.1, 2.2, "booking_services", "[Allocations]",
             ["PK  id INT", "FK  booking_id INT", "FK  vendor_id INT", "FK  service_id INT", "    agreed_price DECIMAL"],
             fc="#f0fdfa", ec="#0d9488")

    draw_box(ax, 9.0, 1.8, 2.3, 2.4, "payments", "[Milestones 25/50/25]",
             ["PK  id INT", "FK  booking_id INT", "FK  customer_id INT", "    milestone_name ENUM", "    amount DECIMAL", "    status ENUM"],
             fc="#fefce8", ec="#ca8a04", title_color="#854d0e")

    draw_box(ax, 11.6, 1.8, 2.1, 2.2, "invoices", "[Tax Invoice]",
             ["PK  id INT", "FK  booking_id INT", "FK  payment_id INT", "    invoice_number VARCHAR", "    tax_amount DECIMAL"],
             fc="#fff1f2", ec="#e11d48")

    # Bottom Utility Tables
    draw_box(ax, 5.5, 3.4, 3.0, 2.2, "vendor_requests", "[Dispatch Hub]",
             ["PK  id INT", "FK  wedding_project_id INT", "FK  vendor_id INT", "FK  planner_id INT", "    status ENUM (ACCEPTED/DECLINED)", "    decline_reason TEXT"],
             fc="#faf5ff", ec="#9333ea")

    draw_box(ax, 5.5, 0.8, 3.0, 2.0, "wedding_schedule", "[Timeline Run-of-Show]",
             ["PK  id INT", "FK  wedding_project_id INT", "FK  vendor_id INT", "    ceremony_name VARCHAR", "    event_date DATE", "    start_time TIME"],
             fc="#f0f9ff", ec="#0284c7")

    # Connectors
    draw_arrow(ax, 1.5, 7.0, 1.5, 6.2, "1:N", color="#64748b")
    draw_arrow(ax, 2.7, 5.0, 3.1, 5.8, "1:1", color="#059669")
    draw_arrow(ax, 2.7, 4.2, 3.1, 8.0, "1:1", color="#7c3aed")
    draw_arrow(ax, 2.7, 4.0, 3.1, 2.8, "1:1", color="#c026d3")
    draw_arrow(ax, 2.7, 2.0, 3.1, 2.2, "1:N", color="#64748b")
    draw_arrow(ax, 4.1, 7.5, 5.5, 7.5, "1:N", color="#ea580c")
    draw_arrow(ax, 5.1, 5.8, 5.5, 7.0, "1:N", color="#059669")
    draw_arrow(ax, 8.5, 7.8, 9.0, 7.8, "1:1", color="#dc2626")
    draw_arrow(ax, 7.0, 6.2, 7.0, 5.6, "1:N", color="#9333ea")
    draw_arrow(ax, 5.1, 2.8, 5.5, 4.2, "1:N", color="#9333ea")
    draw_arrow(ax, 8.5, 6.6, 9.0, 5.8, "1:1", color="#16a34a")
    draw_arrow(ax, 10.1, 4.6, 11.6, 5.6, "1:N", color="#0d9488")
    draw_arrow(ax, 10.1, 4.6, 10.1, 4.2, "1:3", color="#ca8a04")
    draw_arrow(ax, 11.3, 2.8, 11.6, 2.8, "1:1", color="#e11d48")
    draw_arrow(ax, 7.0, 3.4, 7.0, 2.8, "ref", color="#0284c7")

    save_fig(fig, "fig_6_er_diagram.png")

# -------------------------------------------------------------
# 3. FIG 7: MULTI-TIER SYSTEM ARCHITECTURE
# -------------------------------------------------------------
def gen_architecture_diagram():
    fig, ax = plt.subplots(figsize=(13, 8))
    ax.set_xlim(0, 13)
    ax.set_ylim(0, 8)
    ax.axis("off")
    ax.set_title("Figure 7.2: Layered MVC & Secure Request-Response Pipeline", fontsize=13, fontweight="bold", pad=15, color="#0f172a")

    # Tier 1: Client
    draw_box(ax, 0.5, 1.0, 3.2, 6.0, "PRESENTATION TIER", "(React 18 SPA / Vite)",
             ["* React Router DOM v6", "* AuthContext & Role Guards", "* Axios Client + JWT Interceptors", "* ThemeContext (Light/Dark)", "* LanguageContext (6 Languages)", "* Dynamic Font Scale (S/M/L/XL)", "* Lucide Icon Library", "* Vanilla CSS Design Tokens"],
             fc="#eff6ff", ec="#3b82f6", title_color="#1d4ed8")

    # Tier 2: API Gateway & Security
    draw_box(ax, 4.2, 4.2, 3.8, 2.8, "SECURITY & GATEWAY", "(Express Middleware Pipeline)",
             ["* express-rate-limit (100 req/15min)", "* CORS Policy Enforcement", "* Helmet Security Headers", "* Google OAuth 2.0 Token Validator", "* JWT Bearer Authentication", "* Role-Based Access Control (RBAC)"],
             fc="#fdf2f8", ec="#ec4899", title_color="#be185d")

    # Tier 2: Controllers & Services
    draw_box(ax, 4.2, 1.0, 3.8, 2.8, "BUSINESS LOGIC TIER", "(Controllers & Domain Services)",
             ["* 20 REST Controllers (Booking, Vendor...)", "* Notification Engine (In-App Alerts)", "* AI Concierge Query Parser", "* GST Invoice & Tax Calculator", "* Multer File Upload Handler", "* Centralized Error Handling"],
             fc="#f5f3ff", ec="#8b5cf6", title_color="#6d28d9")

    # Tier 3: Database & Persistence
    draw_box(ax, 8.5, 1.0, 4.0, 6.0, "DATA PERSISTENCE TIER", "(MySQL 8.0 Enterprise Relational DB)",
             ["* mysql2/promise Connection Pool", "* 28 Third-Normal-Form Tables", "* Foreign Key Referential Cascades", "* Atomic Multi-Table Transactions", "* Composite Indexes on Filter Keys", "* Character Set utf8mb4_unicode_ci", "* Parameterized SQL Statements", "* Strict Audit Timestamps"],
             fc="#ecfdf5", ec="#10b981", title_color="#047857")

    # Arrows
    draw_arrow(ax, 3.7, 5.5, 4.2, 5.5, "HTTP + Bearer", color="#2563eb")
    draw_arrow(ax, 6.1, 4.2, 6.1, 3.8, "Authorized", color="#ec4899")
    draw_arrow(ax, 8.0, 2.5, 8.5, 2.5, "Connection Pool", color="#059669")
    draw_arrow(ax, 8.5, 2.1, 8.0, 2.1, "Result Sets", color="#059669")
    draw_arrow(ax, 4.2, 2.3, 3.7, 2.3, "JSON Payloads", color="#2563eb")

    save_fig(fig, "fig_7_architecture.png")

# -------------------------------------------------------------
# 4. FIG 8.0: OVERALL REQUEST DELEGATION FLOW
# -------------------------------------------------------------
def gen_request_flow_diagram():
    fig, ax = plt.subplots(figsize=(14, 7))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 7)
    ax.axis("off")
    ax.set_title("Figure 8.0: Enterprise Delegation Protocol (Customer -> Planner -> Vendor -> Planner -> Customer)", fontsize=13, fontweight="bold", pad=15, color="#0f172a")

    steps = [
        (0.6, 4.2, "1. Intake", "Customer submits wedding vision,\ndate, guest count & budget", "#eff6ff", "#2563eb"),
        (3.3, 4.2, "2. Curation", "Planner reviews intake &\nchecks vendor availability", "#fff7ed", "#ea580c"),
        (6.0, 4.2, "3. Dispatch", "Planner sends booking request\nwith offered quote to Vendor", "#fdf4ff", "#c026d3"),
        (8.7, 4.2, "4. Evaluation", "Vendor ACCEPTS (locks slot)\nor DECLINES with reason", "#f0fdf4", "#16a34a"),
        (11.4, 4.2, "5. Proposal", "Planner bundles vendors into\ncohesive proposal package", "#fef2f2", "#dc2626"),
        (11.4, 1.2, "6. Approval", "Customer reviews & confirms\nproposal or requests changes", "#ecfdf5", "#059669"),
        (8.7, 1.2, "7. Advance 25%", "Customer pays 25% retainer;\nGST invoice auto-generated", "#fefce8", "#ca8a04"),
        (6.0, 1.2, "8. Execution", "Day-of-wedding ceremony timeline\n& vendor coordination", "#f0f9ff", "#0284c7"),
        (3.3, 1.2, "9. Final 75%", "Mid-term (50%) & Final (25%)\npayments released to vendors", "#f5f3ff", "#7c3aed"),
        (0.6, 1.2, "10. Review", "Verified customer submits\nvendor ratings & testimonials", "#fff1f2", "#e11d48"),
    ]

    for x, y, title, desc, fc, ec in steps:
        draw_box(ax, x, y, 2.2, 1.8, title, "", desc.split("\n"), fc=fc, ec=ec, title_color=ec)

    # Connecting Flow Arrows
    draw_arrow(ax, 2.8, 5.1, 3.3, 5.1, "", color="#2563eb", lw=2)
    draw_arrow(ax, 5.5, 5.1, 6.0, 5.1, "", color="#ea580c", lw=2)
    draw_arrow(ax, 8.2, 5.1, 8.7, 5.1, "", color="#c026d3", lw=2)
    draw_arrow(ax, 10.9, 5.1, 11.4, 5.1, "", color="#16a34a", lw=2)
    draw_arrow(ax, 12.5, 4.2, 12.5, 3.0, "", color="#dc2626", lw=2)
    draw_arrow(ax, 11.4, 2.1, 10.9, 2.1, "", color="#059669", lw=2)
    draw_arrow(ax, 8.7, 2.1, 8.2, 2.1, "", color="#ca8a04", lw=2)
    draw_arrow(ax, 6.0, 2.1, 5.5, 2.1, "", color="#0284c7", lw=2)
    draw_arrow(ax, 3.3, 2.1, 2.8, 2.1, "", color="#7c3aed", lw=2)

    save_fig(fig, "fig_8_0_request_flow.png")

# -------------------------------------------------------------
# 5. FIG 8.1: PROJECT DIRECTORY & COMPONENT TREE
# -------------------------------------------------------------
def gen_directory_diagram():
    fig, ax = plt.subplots(figsize=(13, 8))
    ax.set_xlim(0, 13)
    ax.set_ylim(0, 8)
    ax.axis("off")
    ax.set_title("Figure 8.1.1: Full-Stack Project Folder Hierarchy & Component Tree", fontsize=13, fontweight="bold", pad=15, color="#0f172a")

    draw_box(ax, 0.5, 4.6, 3.6, 2.8, "database/", "[MySQL Schema & Seeds]",
             ["* schema.sql (28 normalized tables)", "* seed.sql (Realistic test accounts)", "* README.md (DB setup guide)", "* Indices on FKs & Filter columns"],
             fc="#fff7ed", ec="#ea580c")

    draw_box(ax, 4.6, 4.2, 3.8, 3.2, "backend/", "[Node / Express Server]",
             ["* server.js (Entry point & routes)", "* config/ (db.js connection pool)", "* controllers/ (20 REST controllers)", "* middleware/ (auth, rateLimit, role)", "* routes/ (20 Express routers)", "* services/ (notifications, chatbot)", "* utils/ (formatters, queryHelper)"],
             fc="#eff6ff", ec="#2563eb")

    draw_box(ax, 8.9, 0.8, 3.6, 6.6, "frontend/src/", "[Vite + React SPA]",
             ["* main.jsx (Bootstrap & Providers)", "* App.jsx (Route definitions & guards)", "* components/ (Navbar, Sidebar, Modal...)", "* context/ (Auth, Theme, Lang, Toast)", "* layouts/ (DashboardLayout.jsx)", "* pages/auth/ (Login, Register, OAuth)", "* pages/planner/ (12 planner pages)", "* pages/vendor/ (11 vendor pages)", "* pages/customer/ (12 customer pages)", "* pages/common/ (Messages, Reports...)", "* styles/ (index.css design tokens)"],
             fc="#ecfdf5", ec="#059669")

    draw_box(ax, 0.5, 0.8, 3.6, 3.4, "backend/controllers/", "[Dedicated REST Handlers]",
             ["* authController.js (Local & OAuth)", "* bookingController.js (Escrow status)", "* vendorController.js (Profiles & slots)", "* budgetController.js (Ledger sync)", "* invoiceController.js (GST calculations)", "* messageController.js (Discussions)", "* reportController.js (Dynamic exports)"],
             fc="#f5f3ff", ec="#7c3aed")

    draw_box(ax, 4.6, 0.8, 3.8, 3.0, "frontend/src/context/", "[Global Reactive State]",
             ["* AuthContext (Token & Role profile)", "* ThemeContext (Light & Dark mode)", "* LanguageContext (6 Indian languages)", "* ToastContext (Transient alerts)", "* RecentlyAccessed (Fast history)"],
             fc="#fef2f2", ec="#dc2626")

    draw_arrow(ax, 4.1, 6.0, 4.6, 6.0, "Imports schema", color="#ea580c")
    draw_arrow(ax, 8.4, 5.8, 8.9, 5.8, "Consumes APIs", color="#2563eb")

    save_fig(fig, "fig_8_1_1_project_tree.png")

# -------------------------------------------------------------
# 6. MODULE ARCHITECTURE DIAGRAMS (Fig 8.2.A to 8.9.A)
# -------------------------------------------------------------
def gen_module_architecture_diagrams():
    modules = [
        ("fig_8_2_a_auth_arch.png", "Figure 8.2.A: Low-Level Architecture - User Authentication & Role Access Control",
         [("Browser Client", "React Auth Form / Google Login", 0.5, 3.0, "#eff6ff", "#2563eb"),
          ("API Gateway", "rateLimitMiddleware (15m limit)\n/api/auth router", 3.8, 3.0, "#fdf2f8", "#ec4899"),
          ("Auth Controller", "bcrypt.compare() /\nGoogle OAuth Client token verify", 7.1, 3.0, "#f5f3ff", "#7c3aed"),
          ("MySQL DB", "users & roles tables\nReturns user_id, role, JWT", 10.4, 3.0, "#ecfdf5", "#059669")]),

        ("fig_8_3_a_req_arch.png", "Figure 8.3.A: Low-Level Architecture - Wedding Requirements & Intake",
         [("Customer View", "CustomerRequirements.jsx\nForm inputs: date, city, budget", 0.5, 3.0, "#eff6ff", "#2563eb"),
          ("Express Route", "/api/requirements\nauthMiddleware & verifyRole(CUSTOMER)", 3.8, 3.0, "#fef2f2", "#dc2626"),
          ("Project Service", "Creates wedding_projects entry &\nassociates wedding_requirements", 7.1, 3.0, "#fff7ed", "#ea580c"),
          ("MySQL Engine", "Inserts into wedding_projects &\nnotifies assigned Planner", 10.4, 3.0, "#ecfdf5", "#059669")]),

        ("fig_8_4_a_vendor_arch.png", "Figure 8.4.A: Low-Level Architecture - Vendor Catalog & Availability Engine",
         [("Vendor Portal", "VendorAvailabilityCalendar.jsx\nClick to toggle AVAILABLE/BLOCKED", 0.5, 3.0, "#eff6ff", "#2563eb"),
          ("Slot Controller", "/api/vendors/:id/availability\nValidates ISO Date & Role", 3.8, 3.0, "#fdf4ff", "#c026d3"),
          ("Conflict Engine", "Checks existing bookings for date;\nPrevents double reservation", 7.1, 3.0, "#f5f3ff", "#7c3aed"),
          ("Availability Table", "vendor_availability upsert\nUpdates calendar UI state", 10.4, 3.0, "#ecfdf5", "#059669")]),

        ("fig_8_5_a_coord_arch.png", "Figure 8.5.A: Low-Level Architecture - Enterprise Coordination & Dispatch Workflow",
         [("Planner Hub", "VendorRequests.jsx\nSelects Vendor & dispatches inquiry", 0.5, 3.0, "#eff6ff", "#2563eb"),
          ("Dispatch API", "POST /api/vendor-requests\nStatus defaults to PENDING", 3.8, 3.0, "#fff7ed", "#ea580c"),
          ("Vendor Response", "PUT /api/vendor-requests/:id\nVendor ACCEPTS or DECLINES with note", 7.1, 3.0, "#fdf4ff", "#c026d3"),
          ("Proposal Builder", "Locks slot into BookingService\nTriggers Customer Review state", 10.4, 3.0, "#f0fdf4", "#16a34a")]),

        ("fig_8_6_a_payment_arch.png", "Figure 8.6.A: Low-Level Architecture - Milestone Payments & Automated Invoicing",
         [("Customer View", "CustomerPayments.jsx\nAdvance (25%), Mid (50%), Final (25%)", 0.5, 3.0, "#eff6ff", "#2563eb"),
          ("Payment Route", "POST /api/payments/:id/pay\nValidates amount & milestone stage", 3.8, 3.0, "#fefce8", "#ca8a04"),
          ("Invoice Generator", "Computes 18% GST (CGST+SGST)\nGenerates unique INV-YYYY-SEQ", 7.1, 3.0, "#fff1f2", "#e11d48"),
          ("Ledger DB", "Updates payment_transactions &\nrefreshes budget actual spent", 10.4, 3.0, "#ecfdf5", "#059669")]),

        ("fig_8_7_a_schedule_arch.png", "Figure 8.7.A: Low-Level Architecture - Ceremony Itinerary & Document Vault",
         [("Planner / Couple", "WeddingSchedule.jsx\nTimetable, venues, assigned vendors", 0.5, 3.0, "#eff6ff", "#2563eb"),
          ("Schedule Router", "/api/schedule & /api/documents\nMulter file parser (PDF/PNG)", 3.8, 3.0, "#f0f9ff", "#0284c7"),
          ("Event Sync", "Associates event timing with\nconfirmed vendor contacts", 7.1, 3.0, "#f5f3ff", "#7c3aed"),
          ("Document Storage", "uploads/docs/ directory &\ndocuments relational table", 10.4, 3.0, "#ecfdf5", "#059669")]),

        ("fig_8_8_a_messaging_arch.png", "Figure 8.8.A: Low-Level Architecture - Real-Time Messaging & AI Concierge",
         [("User Interface", "MessagesPage.jsx & Chatbot.jsx\nLive input drawer & query bubble", 0.5, 3.0, "#eff6ff", "#2563eb"),
          ("Message Gateway", "/api/messages & /api/chatbot\nSanitizes text & maps recipient", 3.8, 3.0, "#fdf2f8", "#ec4899"),
          ("Concierge Engine", "Natural language keyword matcher\nQueries project status & vendors", 7.1, 3.0, "#fefce8", "#ca8a04"),
          ("Chat Persistence", "conversations & chatbot_messages\nUnread badges & timestamps", 10.4, 3.0, "#ecfdf5", "#059669")]),

        ("fig_8_9_a_analytics_arch.png", "Figure 8.9.A: Low-Level Architecture - Executive Dashboard & Business Analytics",
         [("Role Dashboard", "PlannerDashboard.jsx / ReportsPage.jsx\nKPI metric cards & charts", 0.5, 3.0, "#eff6ff", "#2563eb"),
          ("Analytics API", "GET /api/reports & /api/admin/stats\nDate & category query params", 3.8, 3.0, "#eff6ff", "#2563eb"),
          ("SQL Aggregator", "GROUP BY status, category, date\nSUM(amount) & COUNT(bookings)", 7.1, 3.0, "#f5f3ff", "#7c3aed"),
          ("Export Streamer", "Generates CSV / Print-ready ledger\nStreamed to browser client", 10.4, 3.0, "#ecfdf5", "#059669")])
    ]

    for fname, title, boxes in modules:
        fig, ax = plt.subplots(figsize=(13, 6))
        ax.set_xlim(0, 13)
        ax.set_ylim(0, 6)
        ax.axis("off")
        ax.set_title(title, fontsize=12, fontweight="bold", pad=15, color="#0f172a")

        for b_title, b_desc, x, y, fc, ec in boxes:
            draw_box(ax, x, y, 2.5, 2.4, b_title, "", b_desc.split("\n"), fc=fc, ec=ec, title_color=ec)

        draw_arrow(ax, 3.0, 4.2, 3.8, 4.2, "Request", color="#2563eb", lw=1.8)
        draw_arrow(ax, 6.3, 4.2, 7.1, 4.2, "Delegate", color="#7c3aed", lw=1.8)
        draw_arrow(ax, 9.6, 4.2, 10.4, 4.2, "Persist", color="#059669", lw=1.8)

        draw_arrow(ax, 10.4, 3.4, 9.6, 3.4, "Result", color="#059669", lw=1.5, ls="--")
        draw_arrow(ax, 7.1, 3.4, 6.3, 3.4, "Process", color="#7c3aed", lw=1.5, ls="--")
        draw_arrow(ax, 3.8, 3.4, 3.0, 3.4, "JSON State", color="#2563eb", lw=1.5, ls="--")

        save_fig(fig, fname)

# -------------------------------------------------------------
# 7. UI MOCKUPS / SCREENSHOT DIAGRAMS (Fig 8.2.1 to 8.9.1)
# -------------------------------------------------------------
def gen_ui_mockup_diagrams():
    uis = [
        ("fig_8_2_1_auth_ui.png", "Figure 8.2: User Authentication & Role Selection Interface",
         "Vows & Veils - Enterprise Access Gateway",
         [("Login Credentials", "Input: planner@wedding.com | password123", "#eff6ff"),
          ("Dual-Auth Support", "Standard Bcrypt Hash Authentication + Official Google OAuth 2.0 Button", "#f0fdf4"),
          ("Active Role Routing", "Auto-redirects to /planner/dashboard, /vendor/dashboard, or /customer/dashboard", "#faf5ff"),
          ("Security Guard", "express-rate-limit 15 req/15min active with failed attempt throttling", "#fff1f2")]),

        ("fig_8_3_1_req_ui.png", "Figure 8.3: Customer Wedding Requirements & Intake Submission Interface",
         "Couple Onboarding - Requirements Specification",
         [("Couple Information", "Names: Rahul & Anita Verma | City: Bangalore | Wedding Date: 2026-11-20", "#eff6ff"),
          ("Scope & Budget", "Estimated Guests: 450 | Total Ceiling Budget: INR 25,00,000", "#fefce8"),
          ("Service Preferences", "Mandatory categories: Venue Decor, Multi-Cuisine Banquets, Drone Photography, Sangeet DJ", "#f0fdfa"),
          ("Planner Assignment", "Assigned Lead Concierge: Priya Sharma (Elite Wedding Planners)", "#ecfdf5")]),

        ("fig_8_4_1_vendor_ui.png", "Figure 8.4: Vendor Availability Calendar & Real-Time Slot Reservation Interface",
         "Pixel & Petals Photography - Availability Manager",
         [("Monthly Calendar Grid", "November 2026: Green = AVAILABLE, Red = BOOKED, Yellow = PENDING INQUIRY", "#f0fdf4"),
          ("Interactive Date Toggling", "One-click status toggle with automatic date conflict prevention", "#eff6ff"),
          ("Service Packages", "Package 1: Candid Pre-Wedding | Package 2: 3-Day Royal Wedding & Drone Coverage", "#faf5ff"),
          ("Booking Direct Link", "Dates locked by confirmed Planner Proposals cannot be double-booked", "#fff1f2")]),

        ("fig_8_5_1_coord_ui.png", "Figure 8.5: Planner Coordination & Vendor Request Dispatch Interface",
         "Proposal Builder - Vendor Dispatch & Negotiation Center",
         [("Dispatched Requests", "4 Requests Dispatched: Shutter (Photography), Royal Mandap (Decor), Annapoorna (Catering), DJ Beats", "#fff7ed"),
          ("Vendor Responses", "3 ACCEPTED (Rates Locked) | 1 DECLINED with Reason (Alternative Selected in 1 click)", "#f0fdf4"),
          ("Unified Proposal Card", "Total Proposed Package: INR 18,50,000 (Within Couple's INR 25,00,000 Budget)", "#ecfdf5"),
          ("Client Approval State", "Status: PROPOSAL_APPROVED by Couple | Triggering Milestone Payment Schedules", "#eff6ff")]),

        ("fig_8_6_1_payment_ui.png", "Figure 8.6: Milestone Payments & Automated GST Tax Invoicing Interface",
         "Financial Ledger & Milestone Payment Schedules",
         [("Milestone 1 (25% Advance)", "Amount: INR 4,62,500 | Status: PAID (Transaction Ref: TXN-2026-9812) | Invoice: INV-2026-001", "#f0fdf4"),
          ("Milestone 2 (50% Mid-Term)", "Amount: INR 9,25,000 | Status: PENDING (Due 15 days prior to ceremony)", "#fefce8"),
          ("Milestone 3 (25% Final)", "Amount: INR 4,62,500 | Status: PENDING (Released upon wedding completion)", "#f8fafc"),
          ("GST Invoice Breakdown", "Taxable Subtotal: INR 3,91,949 | CGST (9%): INR 35,275 | SGST (9%): INR 35,275 | Total: INR 4,62,500", "#fff1f2")]),

        ("fig_8_7_1_schedule_ui.png", "Figure 8.7: Run-of-Show Ceremony Itinerary & Digital Document Hub Interface",
         "Wedding Day Timeline & Document Vault",
         [("Mehndi & Sangeet", "Date: 2026-11-19 | 17:00 - 22:00 | Venue: Crystal Lawn | Assigned: DJ Rohit Roy", "#fdf4ff"),
          ("Traditional Muhurtham", "Date: 2026-11-20 | 06:30 - 09:30 | Venue: Main Mandap | Assigned: Shutter Photography", "#fff7ed"),
          ("Grand Reception", "Date: 2026-11-20 | 19:00 - 23:00 | Venue: Grand Ballroom | Assigned: Royal Catering", "#f0fdf4"),
          ("Document Vault", "Uploaded: Mandap Blueprint (PDF), Food Safety Certificate (PDF), Vendor Contract (Signed)", "#eff6ff")]),

        ("fig_8_8_1_messaging_ui.png", "Figure 8.8: Multi-Role Messaging & Contextual AI Concierge Chatbot Interface",
         "Real-Time Collaboration Center & AI Concierge",
         [("Active Conversation", "Planner (Priya Sharma) <-> Couple (Rahul & Anita): 'Floral stage mockups uploaded for your review.'", "#eff6ff"),
          ("AI Concierge Bubble", "Couples ask: 'What is our remaining budget?' -> AI replies: 'You have INR 6,50,000 remaining unallocated.'", "#fefce8"),
          ("Unread Badge Counter", "Header badge alerts user of 3 new unread incoming messages and booking status updates", "#f0fdf4"),
          ("Role Guard Privacy", "Vendors cannot view Customer direct budget or other vendors' contracted pricing", "#fff1f2")]),

        ("fig_8_9_1_analytics_ui.png", "Figure 8.9: Executive Analytics Dashboard & KPI Reporting Interface",
         "Executive Command Dashboard & Performance Metrics",
         [("Key Metric Counters", "Active Weddings: 5 | Confirmed Bookings: 12 | Dispatched Vendors: 28 | Invoiced: INR 42,80,000", "#eff6ff"),
          ("Category Spend Chart", "Banquets & Catering (42%) | Decor & Mandap (24%) | Photography (18%) | Music & DJ (16%)", "#ecfdf5"),
          ("Vendor Acceptance Rate", "88.9% Acceptance Rate | Average Vendor Response Latency: 2.4 Hours", "#faf5ff"),
          ("Dynamic Report Exporter", "One-click export to CSV / Excel and formatted PDF printable accounting summaries", "#fff7ed")])
    ]

    for fname, title, header_text, cards in uis:
        fig, ax = plt.subplots(figsize=(13, 7.5))
        ax.set_xlim(0, 13)
        ax.set_ylim(0, 7.5)
        ax.axis("off")
        ax.set_title(title, fontsize=12, fontweight="bold", pad=15, color="#0f172a")

        # Outer Browser Frame
        frame = patches.FancyBboxPatch((0.5, 0.5), 12.0, 6.2, boxstyle="round,pad=0.1", ec="#cbd5e1", fc="#ffffff", lw=2)
        ax.add_patch(frame)

        # Header Bar
        hbar = patches.Rectangle((0.5, 5.8), 12.0, 0.9, fc="#1e293b", ec="#1e293b")
        ax.add_patch(hbar)
        ax.text(0.9, 6.25, f"WPVCP Suite - {header_text}", fontsize=11, fontweight="bold", color="#ffffff", va="center")
        ax.text(12.0, 6.25, "Status: LIVE (MySQL Connected)", fontsize=8, color="#38bdf8", ha="right", va="center")

        # Window controls dots
        for idx, col in enumerate(["#ef4444", "#f59e0b", "#10b981"]):
            circle = patches.Circle((0.8 + idx*0.25, 6.45), 0.08, fc=col, ec="none")
            ax.add_patch(circle)

        # 4 content cards
        coords = [(0.8, 3.3, 5.6, 2.2), (6.6, 3.3, 5.6, 2.2), (0.8, 0.8, 5.6, 2.2), (6.6, 0.8, 5.6, 2.2)]
        for (c_title, c_desc, bg_color), (cx, cy, cw, ch) in zip(cards, coords):
            card_patch = patches.FancyBboxPatch((cx, cy), cw, ch, boxstyle="round,pad=0.08", ec="#cbd5e1", fc=bg_color, lw=1)
            ax.add_patch(card_patch)
            ax.text(cx + 0.2, cy + ch - 0.35, c_title, fontsize=9.5, fontweight="bold", color="#0f172a")
            ax.plot([cx + 0.2, cx + cw - 0.2], [cy + ch - 0.5, cy + ch - 0.5], color="#94a3b8", lw=0.6)
            
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
                ax.text(cx + 0.2, l_y, line, fontsize=8.0, color="#334155")
                l_y -= 0.25

        save_fig(fig, fname)

if __name__ == "__main__":
    print("Generating comprehensive architectural and domain diagrams...")
    gen_class_diagram()
    gen_er_diagram()
    gen_architecture_diagram()
    gen_request_flow_diagram()
    gen_directory_diagram()
    gen_module_architecture_diagrams()
    gen_ui_mockup_diagrams()
    print("All diagrams generated successfully!")
