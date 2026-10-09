"""
Master script to assemble the 100% BLACK AND WHITE Academic Project Report for:
Wedding Planner and Vendor Coordination Platform (WPVCP)
Vows & Veils — Enterprise Wedding Concierge & Coordination Suite

Course: 23CS54C – MODERN WEB TECHNOLOGIES
College: NATIONAL ENGINEERING COLLEGE, KOVILPATTI
Student: HARIRAAM B (24104085)
"""

import os
import json
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

from modules_data import modules_data

FIGURES_DIR = r"c:\Users\Welcome\Downloads\WPVCP Modified\report_generator\figures_bw"
METADATA_FILE = r"c:\Users\Welcome\Downloads\WPVCP Modified\report_generator\schema_metadata.json"

OUTPUT_PATH_1 = r"c:\Users\Welcome\Downloads\Wedding_Planner_and_Vendor_Coordination_Platform_Report_BW.docx"
OUTPUT_PATH_2 = r"c:\Users\Welcome\Downloads\WPVCP_Academic_Project_Report_BW.docx"
WORKSPACE_OUTPUT = r"c:\Users\Welcome\Downloads\WPVCP Modified\WPVCP_Academic_Project_Report_BW.docx"
LOCKED_FILE = r"c:\Users\Welcome\Downloads\Wedding_Planner_and_Vendor_Coordination_Platform_Report.docx"

with open(METADATA_FILE, 'r', encoding='utf-8') as f:
    schema_metadata = json.load(f)

doc = Document()

# Set Standard A4 Page Setup and 1.0 inch Margins
for section in doc.sections:
    section.page_width = Inches(8.27)
    section.page_height = Inches(11.69)
    section.top_margin = Inches(1.0)
    section.bottom_margin = Inches(1.0)
    section.left_margin = Inches(1.0)
    section.right_margin = Inches(1.0)

# Configure Default Normal Style Font - Strict Black & White
style_normal = doc.styles['Normal']
font = style_normal.font
font.name = 'Times New Roman'
font.size = Pt(12)
font.color.rgb = RGBColor(0, 0, 0)

# XML Helpers for pure Black & White Table Formatting
def set_cell_background(cell, fill_hex="FFFFFF"):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=130, right=130):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def set_table_borders_bw(table, sz="4"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="{sz}" w:space="0" w:color="000000"/>'
        f'<w:bottom w:val="single" w:sz="{sz}" w:space="0" w:color="000000"/>'
        f'<w:left w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'<w:insideH w:val="single" w:sz="{sz}" w:space="0" w:color="CCCCCC"/>'
        f'<w:insideV w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def make_header_repeat(row):
    trPr = row._tr.get_or_add_trPr()
    tblHeader = parse_xml(f'<w:tblHeader {nsdecls("w")}/>')
    trPr.append(tblHeader)

def make_row_cant_split(row):
    trPr = row._tr.get_or_add_trPr()
    cantSplit = parse_xml(f'<w:cantSplit {nsdecls("w")}/>')
    trPr.append(cantSplit)

def add_styled_table(headers, data, col_widths=None, align_cols=None):
    table = doc.add_table(rows=len(data) + 1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders_bw(table)

    # Style Header Row - Light grayscale background #E5E5E5 with bold black text
    hdr_cells = table.rows[0].cells
    make_header_repeat(table.rows[0])
    make_row_cant_split(table.rows[0])
    
    for i, header in enumerate(headers):
        hdr_cells[i].text = header
        set_cell_background(hdr_cells[i], "E5E5E5")
        set_cell_margins(hdr_cells[i], top=120, bottom=120, left=130, right=130)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER if align_cols and align_cols[i] == 'C' else WD_ALIGN_PARAGRAPH.LEFT
        for run in p.runs:
            run.font.name = "Times New Roman"
            run.font.size = Pt(9.5)
            run.font.bold = True
            run.font.color.rgb = RGBColor(0, 0, 0)

    # Style Data Rows
    for r_idx, row_data in enumerate(data):
        row = table.rows[r_idx + 1]
        make_row_cant_split(row)
        bg_col = "F9F9F9" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(row_data):
            cell = row.cells[c_idx]
            cell.text = str(val)
            set_cell_background(cell, bg_col)
            set_cell_margins(cell, top=80, bottom=80, left=130, right=130)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if align_cols and align_cols[c_idx] == 'C' else WD_ALIGN_PARAGRAPH.LEFT
            for run in p.runs:
                run.font.name = "Times New Roman"
                run.font.size = Pt(8.5)
                run.font.color.rgb = RGBColor(0, 0, 0)

    if col_widths:
        for row in table.rows:
            for idx, width in enumerate(col_widths):
                row.cells[idx].width = Inches(width)

    p_after = doc.add_paragraph()
    p_after.paragraph_format.space_before = Pt(2)
    p_after.paragraph_format.space_after = Pt(6)
    return table

def add_p(text="", bold=False, italic=False, size=12, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_before=0, space_after=6):
    p = doc.add_paragraph()
    p.alignment = align
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = 1.15
    if text:
        run = p.add_run(text)
        run.bold = bold
        run.italic = italic
        run.font.name = "Times New Roman"
        run.font.size = Pt(size)
        run.font.color.rgb = RGBColor(0, 0, 0)
    return p

def add_bullet(title="", desc="", size=12):
    p = doc.add_paragraph(style='List Paragraph')
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.15
    if title:
        r1 = p.add_run(title + ": ")
        r1.bold = True
        r1.font.name = "Times New Roman"
        r1.font.size = Pt(size)
        r1.font.color.rgb = RGBColor(0, 0, 0)
    if desc:
        r2 = p.add_run(desc)
        r2.bold = False
        r2.font.name = "Times New Roman"
        r2.font.size = Pt(size)
        r2.font.color.rgb = RGBColor(0, 0, 0)
    return p

def add_ch_title(ch_num, ch_title):
    doc.add_page_break()
    p_ch = doc.add_paragraph()
    p_ch.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_ch.paragraph_format.space_before = Pt(12)
    p_ch.paragraph_format.space_after = Pt(6)
    p_ch.paragraph_format.keep_with_next = True
    r_ch = p_ch.add_run(f"CHAPTER {ch_num}")
    r_ch.bold = True
    r_ch.font.name = "Times New Roman"
    r_ch.font.size = Pt(16)
    r_ch.font.color.rgb = RGBColor(0, 0, 0)

    p_t = doc.add_paragraph()
    p_t.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_t.paragraph_format.space_before = Pt(6)
    p_t.paragraph_format.space_after = Pt(18)
    p_t.paragraph_format.keep_with_next = True
    r_t = p_t.add_run(ch_title.upper())
    r_t.bold = True
    r_t.font.name = "Times New Roman"
    r_t.font.size = Pt(16)
    r_t.font.color.rgb = RGBColor(0, 0, 0)

def add_sec_h2(title):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(title)
    r.bold = True
    r.font.name = "Times New Roman"
    r.font.size = Pt(14)
    r.font.color.rgb = RGBColor(0, 0, 0)
    return p

def add_sec_h3(title):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(title)
    r.bold = True
    r.font.name = "Times New Roman"
    r.font.size = Pt(13)
    r.font.color.rgb = RGBColor(0, 0, 0)
    return p

def add_figure(img_name, caption_text, width_inches=5.8):
    img_path = os.path.join(FIGURES_DIR, img_name)
    if os.path.exists(img_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(8)
        p_img.paragraph_format.space_after = Pt(4)
        p_img.paragraph_format.keep_with_next = True
        run = p_img.add_run()
        run.add_picture(img_path, width=Inches(width_inches))

        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_before = Pt(2)
        p_cap.paragraph_format.space_after = Pt(10)
        r_cap = p_cap.add_run(caption_text)
        r_cap.font.name = "Times New Roman"
        r_cap.font.size = Pt(10)
        r_cap.font.bold = False
        r_cap.font.color.rgb = RGBColor(0, 0, 0)
    else:
        print(f"Warning: BW Image file not found: {img_path}")

print("Building Black and White Academic Report...")

# =====================================================================
# COVER PAGE (STRICT BLACK & WHITE)
# =====================================================================
add_p("WEDDING PLANNER AND VENDOR COORDINATION PLATFORM (WPVCP)", bold=True, size=15, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=24, space_after=6)
add_p("Vows & Veils — Enterprise Wedding Concierge & Coordination Suite", italic=True, size=12, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=32)

add_p("23CS54C – MODERN WEB TECHNOLOGIES", bold=False, size=13, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=36)

add_p("Submitted by", bold=True, size=12, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=4)
add_p("HARIRAAM B  (24104085)", bold=True, size=13, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=36)

add_p("In partial fulfillment for the award of the degree", bold=False, size=12, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=2)
add_p("of", bold=False, size=12, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=2)
add_p("BACHELOR OF ENGINEERING", bold=True, size=13, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=2)
add_p("in", bold=True, size=12, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=2)
add_p("COMPUTER SCIENCE AND ENGINEERING", bold=True, size=13, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=48)

add_p("NATIONAL ENGINEERING COLLEGE", bold=True, size=14, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=2)
add_p("(An Autonomous Institution affiliated to Anna University, Chennai)", bold=True, size=11, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=2)
add_p("K.R.NAGAR, KOVILPATTI - 628503", bold=True, size=12, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=8)
add_p("OCTOBER - 2026", bold=True, size=12, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=12)

# =====================================================================
# BONAFIDE CERTIFICATE (BLACK & WHITE)
# =====================================================================
doc.add_page_break()
add_p("NATIONAL ENGINEERING COLLEGE", bold=True, size=14, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=20, space_after=2)
add_p("(An Autonomous Institution affiliated to Anna University, Chennai)", bold=True, size=11, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=2)
add_p("K.R.NAGAR, KOVILPATTI - 628503", bold=True, size=12, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=30)

add_p("BONAFIDE CERTIFICATE", bold=True, size=14, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=24)

cert_text = (
    "This is to certify that this project report titled \"Wedding Planner and Vendor Coordination Platform (WPVCP) "
    "— Vows & Veils Enterprise Suite\" is the bonafide work of B HARIRAAM (24104085) who carried out the project work "
    "under my supervision in partial fulfillment for the award of the degree of Bachelor of Engineering in Computer "
    "Science and Engineering of Anna University, Chennai during the academic year 2026."
)
add_p(cert_text, size=12, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=40)

add_p("Course Instructor / Project Guide", bold=True, size=12, align=WD_ALIGN_PARAGRAPH.RIGHT, space_after=50)

exam_text = (
    "Submitted to the 23CS54C – MODERN WEB TECHNOLOGIES Viva-Voce examination held at National Engineering College, "
    "K.R. Nagar, Kovilpatti on ____________________"
)
add_p(exam_text, size=12, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=40)

# Signatures Table
sig_table = doc.add_table(rows=1, cols=2)
sig_table.alignment = WD_TABLE_ALIGNMENT.CENTER
sig_cells = sig_table.rows[0].cells
sig_cells[0].paragraphs[0].text = "Internal Examiner"
sig_cells[0].paragraphs[0].runs[0].font.bold = True
sig_cells[0].paragraphs[0].runs[0].font.name = "Times New Roman"
sig_cells[0].paragraphs[0].runs[0].font.size = Pt(12)
sig_cells[0].paragraphs[0].runs[0].font.color.rgb = RGBColor(0, 0, 0)
sig_cells[0].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.LEFT

sig_cells[1].paragraphs[0].text = "External Examiner"
sig_cells[1].paragraphs[0].runs[0].font.bold = True
sig_cells[1].paragraphs[0].runs[0].font.name = "Times New Roman"
sig_cells[1].paragraphs[0].runs[0].font.size = Pt(12)
sig_cells[1].paragraphs[0].runs[0].font.color.rgb = RGBColor(0, 0, 0)
sig_cells[1].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT

# =====================================================================
# TABLE OF CONTENTS
# =====================================================================
doc.add_page_break()
add_p("TABLE OF CONTENTS", bold=True, size=15, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=16, space_after=18)

toc_headers = ["CH NO", "TITLE", "PAGE NO"]
toc_data = [
    ["1", "INTRODUCTION", "3"],
    ["2", "OBJECTIVES", "5"],
    ["3", "SYSTEM DESCRIPTION & DOMAIN SCOPE", "7"],
    ["4", "UML CLASS DIAGRAM", "10"],
    ["5", "RELATIONAL TABLE STRUCTURES (DATA DICTIONARY)", "12"],
    ["6", "ENTITY-RELATIONSHIP (ER) DIAGRAM", "26"],
    ["7", "TECH STACK & MULTI-TIER SYSTEM ARCHITECTURE", "28"],
    ["8", "SYSTEM MODULES & DETAILED DESIGN", "32"],
    ["", "8.0 Design Approach & Sizing Baseline", "32"],
    ["", "8.1 Project Directory Structure & Hierarchy", "35"],
    ["", "8.2 User Authentication & Role-Based Access Control", "38"],
    ["", "8.3 Customer Requirements & Wedding Project Onboarding", "43"],
    ["", "8.4 Vendor Catalog & Dynamic Availability Calendar Engine", "47"],
    ["", "8.5 Enterprise Coordination Workflow & Vendor Dispatch", "52"],
    ["", "8.6 Milestone Payments, Invoices & Escrow Budget Ledger", "57"],
    ["", "8.7 Ceremony Itinerary, Event Scheduling & Document Vault", "62"],
    ["", "8.8 Real-Time Messaging, Notifications & AI Concierge", "66"],
    ["", "8.9 Executive Analytics Dashboard & Cross-Role Reporting", "71"],
    ["9", "CONCLUSION & FUTURE ENHANCEMENTS", "75"]
]
add_styled_table(toc_headers, toc_data, col_widths=[0.9, 4.4, 0.9], align_cols=['C', 'L', 'C'])

# =====================================================================
# LIST OF TABLES
# =====================================================================
doc.add_page_break()
add_p("LIST OF TABLES", bold=True, size=15, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=16, space_after=18)

lot_headers = ["TABLE NO", "TABLE TITLE", "PAGE NO"]
lot_data = [
    ["Table 5.1", "Schema: roles (Privilege Tier Master)", "12"],
    ["Table 5.2", "Schema: users (Global Identity Master)", "12"],
    ["Table 5.3", "Schema: planners (Certified Planner Profile)", "13"],
    ["Table 5.4", "Schema: service_categories (Service Taxonomy Master)", "13"],
    ["Table 5.5", "Schema: vendors (Verified Vendor Partner Profile)", "14"],
    ["Table 5.6", "Schema: vendor_services (Published Service Packages)", "14"],
    ["Table 5.7", "Schema: customers (Engaged Couple Profile)", "15"],
    ["Table 5.8", "Schema: wedding_projects (Central Operational Pivot)", "15"],
    ["Table 5.9", "Schema: wedding_requirements (Intake Specifications)", "16"],
    ["Table 5.10", "Schema: vendor_availability (Dynamic Calendar Slots)", "17"],
    ["Table 5.11", "Schema: vendor_requests (Planner Dispatch Inquiries)", "17"],
    ["Table 5.12", "Schema: bookings (Contracted Wedding Packages)", "18"],
    ["Table 5.13", "Schema: booking_services (Service Allocation Items)", "19"],
    ["Table 5.14", "Schema: payments (Milestone Escrow Schedules)", "19"],
    ["Table 5.15", "Schema: payment_transactions (Payment Gateway Ledger)", "20"],
    ["Table 5.16", "Schema: invoices (Standard Commercial Tax Invoices)", "20"],
    ["Table 5.17", "Schema: budgets (Financial Ceiling Master)", "21"],
    ["Table 5.18", "Schema: budget_items (Category-Wise Expense Breakdown)", "21"],
    ["Table 5.19", "Schema: wedding_schedule (Run-of-Show Timetable)", "22"],
    ["Table 5.20", "Schema: documents (Secure File Upload Vault)", "22"],
    ["Table 5.21", "Schema: conversations (Discussion Threads)", "23"],
    ["Table 5.22", "Schema: messages (Real-Time Communication Payloads)", "23"],
    ["Table 5.23", "Schema: notifications (System Workflow Alerts)", "24"],
    ["Table 5.24", "Schema: reviews (Verified Ratings & Testimonials)", "24"],
    ["Table 5.25", "Schema: wishlists (Couple Service Curation)", "25"],
    ["Table 5.26", "Schema: support_requests (Helpdesk Support Tickets)", "25"],
    ["Table 5.27", "Schema: chatbot_conversations (AI Concierge Sessions)", "26"],
    ["Table 5.28", "Schema: chatbot_messages (Conversational Query Audit)", "26"],
    ["Table 7.1", "Comprehensive Technical Stack Matrix", "28"],
    ["Table 8.0", "Shared System Sizing Baseline Assumptions", "33"]
]
add_styled_table(lot_headers, lot_data, col_widths=[1.2, 4.1, 0.9], align_cols=['C', 'L', 'C'])

# =====================================================================
# LIST OF FIGURES
# =====================================================================
doc.add_page_break()
add_p("LIST OF FIGURES", bold=True, size=15, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=16, space_after=18)

lof_headers = ["FIGURE NO", "FIGURE TITLE", "PAGE NO"]
lof_data = [
    ["Figure 4", "Core Entity UML Class Diagram (WPVCP Domain Model)", "10"],
    ["Figure 6", "Entity-Relationship Diagram (28 Normalized MySQL Tables)", "27"],
    ["Figure 7.2", "Layered MVC & Secure Request-Response Pipeline", "30"],
    ["Figure 8.0", "Enterprise Delegation Protocol Flow (Customer -> Planner -> Vendor)", "34"],
    ["Figure 8.1.1", "Full-Stack Project Folder Hierarchy & Component Tree", "36"],
    ["Figure 8.2.A", "Low-Level Architecture – User Authentication & Access Control", "39"],
    ["Figure 8.2", "User Authentication & Role Selection Interface Layout", "41"],
    ["Figure 8.3.A", "Low-Level Architecture – Wedding Requirements & Onboarding", "44"],
    ["Figure 8.3", "Customer Wedding Requirements & Intake Submission Interface", "46"],
    ["Figure 8.4.A", "Low-Level Architecture – Vendor Catalog & Availability Engine", "48"],
    ["Figure 8.4", "Vendor Availability Calendar & Slot Manager Interface", "50"],
    ["Figure 8.5.A", "Low-Level Architecture – Enterprise Coordination & Dispatch", "53"],
    ["Figure 8.5", "Planner Coordination & Vendor Request Dispatch Interface", "55"],
    ["Figure 8.6.A", "Low-Level Architecture – Milestone Payments & Invoices", "58"],
    ["Figure 8.6", "Milestone Payments & Automated GST Tax Invoicing Interface", "60"],
    ["Figure 8.7.A", "Low-Level Architecture – Ceremony Itinerary & Document Vault", "63"],
    ["Figure 8.7", "Run-of-Show Ceremony Itinerary & Digital Document Hub", "65"],
    ["Figure 8.8.A", "Low-Level Architecture – Real-Time Messaging & AI Concierge", "67"],
    ["Figure 8.8", "Multi-Role Messaging & Contextual AI Concierge Chatbot", "69"],
    ["Figure 8.9.A", "Low-Level Architecture – Executive Analytics & Reporting Engine", "72"],
    ["Figure 8.9", "Executive Analytics Dashboard & KPI Reporting Interface", "74"]
]
add_styled_table(lof_headers, lof_data, col_widths=[1.2, 4.1, 0.9], align_cols=['C', 'L', 'C'])

# Add Section Break for Page Numbering in Section 2 (Body starts at Page 1)
new_sec = doc.add_section()
new_sec.top_margin = Inches(1.0)
new_sec.bottom_margin = Inches(1.0)
new_sec.left_margin = Inches(1.0)
new_sec.right_margin = Inches(1.0)

# Configure Header & Footer
footer = new_sec.footer
p_ft = footer.paragraphs[0]
p_ft.alignment = WD_ALIGN_PARAGRAPH.RIGHT
r_ft = p_ft.add_run()
r_ft.font.name = "Times New Roman"
r_ft.font.size = Pt(10)
r_ft.font.color.rgb = RGBColor(0, 0, 0)
r_ft_xml = parse_xml(r'''
    <w:fldSimple xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" w:instr="PAGE"/>
''')
p_ft._p.append(r_ft_xml)

print("Writing Body Chapters...")

# =====================================================================
# CHAPTER 1: INTRODUCTION
# =====================================================================
add_ch_title(1, "INTRODUCTION")

add_p(
    "In the modern luxury event and hospitality sector, wedding planning and vendor orchestration represent one of "
    "the most commercially significant yet operationally intricate service domains. Handling wedding ceremonies "
    "involves coordinating multi-day itineraries, extensive vendor teams spanning banqueting, decoration, floral design, "
    "candid and drone photography, live sound engineering, and bridal makeup, alongside strict budgetary constraints "
    "and emotionally invested families. In conventional practice, these operations are conducted through disjointed "
    "manual channels such as WhatsApp chat groups, paper diaries, disconnected spreadsheets, and fragmented bank transfers. "
    "This legacy methodology results in widespread double bookings, unrecorded date conflicts, opaque pricing markups, "
    "untracked change requests, and disputes over milestone disbursements and tax compliance."
)

add_p(
    "There is an acute imperative for a robust, enterprise-grade digital solution that formalizes and automates the entire "
    "lifecycle of wedding coordination under a unified, multi-role web platform. The Wedding Planner and Vendor "
    "Coordination Platform (WPVCP) — commercially designated as \"Vows & Veils — Enterprise Wedding Concierge & Coordination "
    "Suite\" — was engineered to establish end-to-end digital governance across all wedding operational stakeholders."
)

add_p(
    "The architectural cornerstone of Vows & Veils is its strict delegation protocol, governed by the enterprise coordination formula:"
)
add_p("Customer  ⟶  Planner  ⟶  Vendor  ⟶  Planner  ⟶  Customer", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=6, space_after=8)

add_p(
    "Under this protocol, engaged couples (Customers) never contract third-party vendors directly. All requirement specifications, "
    "service solicitations, proposal negotiations, and milestone disbursements are mediated by certified Wedding Planners. "
    "This prevents vendor disintermediation, protects clients against price gouging through transparent negotiated contracts, "
    "and guarantees that vendors receive structured, escrow-protected milestone payments upon successful stage delivery."
)

add_p(
    "The application is structured around four distinct security domains and functional scopes: Client Intake and Requirements "
    "Management, which digitizes couple profiles, ceremony dates, guest counts, and budgetary allocations; Vendor Logistics and "
    "Availability Management, which empowers verified service providers to publish tiered packages and maintain real-time "
    "date-locking calendars; Enterprise Project Coordination and Milestone Billing, which orchestrates request dispatches, "
    "formal client approvals, 25%/50%/25% installment ledgers, and automated GST tax invoicing; and Intelligent Collaboration, "
    "which provides multi-role instant messaging, unread badge counters, system event notifications, and an embedded contextual "
    "AI concierge chatbot querying live database states."
)

add_p(
    "The system is deployed on a robust full-stack architecture comprising a React 18 single-page application (SPA) bundled with "
    "Vite, an Express.js REST API with connection-pooled MySQL 8.0, and dual authentication via Google OAuth 2.0 and bcrypt password "
    "hashing. This report delivers an exhaustive technical documentation of the platform's architectural topology, relational data "
    "dictionary, design principles, mathematical sizing baselines, and implementation results."
)

# =====================================================================
# CHAPTER 2: OBJECTIVES
# =====================================================================
add_ch_title(2, "OBJECTIVES")

add_p("The primary engineering, architectural, and business objectives of the Wedding Planner and Vendor Coordination Platform are:")

add_bullet("To Digitize End-to-End Wedding Operations", "Replace fragmented paper diaries, informal messaging threads, and disconnected spreadsheets with a centralized, cloud-accessible digital coordination portal.")
add_bullet("To Enforce Enterprise Delegation Protocol", "Implement a strict five-stage mediation flow (Customer -> Planner -> Vendor -> Planner -> Customer) that prevents client disintermediation, eliminates pricing ambiguity, and ensures quality control.")
add_bullet("To Eliminate Date Conflicts via Real-Time Calendars", "Provide verified vendors with dynamic availability calendars that automatically lock contracted dates to 'BOOKED' upon client confirmation, preventing catastrophic double bookings.")
add_bullet("To Formalize Multi-Role Access Control (RBAC)", "Segregate platform privileges across four strictly isolated user roles: ADMIN, PLANNER, VENDOR, and CUSTOMER, enforcing strict backend middleware authorization barriers.")
add_bullet("To Implement Dual-Channel Secure Authentication", "Provide users with seamless authentication through official Google Identity Services (OAuth 2.0 / prompt=select_account) alongside salted Bcrypt password hashing and 7-day stateless JWT bearer sessions.")
add_bullet("To Automate Milestone Escrow & Invoicing", "Generate automated 25% Advance Retainer, 50% Mid-Term, and 25% Final Settlement schedules, calculating 18% GST (CGST/SGST) and generating downloadable commercial tax invoices.")
add_bullet("To Synchronize Itemized Budget Tracking", "Provide couples and planners with a real-time financial ledger comparing target budget ceilings against category-wise actual allocations across banquets, decor, photography, and music.")
add_bullet("To Coordinate Day-of-Wedding Run-of-Show Timelines", "Digitize hourly ceremony itineraries (e.g., Haldi, Mehndi, Muhurtham, Reception), assigning venues and confirmed vendor points of contact to each event milestone.")
add_bullet("To Enable Internal Multi-Participant Communication", "Deliver low-latency direct messaging between planners, couples, and vendors, backed by notification triggers for proposals, status updates, and milestone deadlines.")
add_bullet("To Deploy Context-Aware AI Concierge Support", "Embed a database-connected conversational chatbot capable of parsing user queries in natural language regarding wedding schedules, budget remaining, and vendor contact info.")
add_bullet("To Deliver Comprehensive Accessibility & Localization", "Incorporate high-contrast Light/Dark themes, 4 dynamic font scale settings (S/M/L/XL), and a comprehensive 6-language translation dictionary (English, Tamil, Hindi, Malayalam, Telugu, Kannada).")

# =====================================================================
# CHAPTER 3: DESCRIPTION
# =====================================================================
add_ch_title(3, "SYSTEM DESCRIPTION & DOMAIN SCOPE")

add_p(
    "The Wedding Planner and Vendor Coordination Platform (WPVCP) is an enterprise-scale, multi-tenant web application "
    "designed to manage the entire operational lifecycle of wedding production. The platform is organized into eight "
    "core functional domains:"
)

add_sec_h2("3.1 Customer Onboarding & Requirements Specification")
add_p(
    "Prospective couples begin their journey by creating a verified profile and submitting a comprehensive wedding intake form. "
    "This captures fundamental planning parameters including target ceremony dates, wedding destination city, guest counts, "
    "aesthetic theme preferences (e.g., Royal Heritage, Minimalist Contemporary, Beachside Coastal), dietary criteria, and "
    "overall ceiling budget. Upon submission, the platform instantiates a corresponding wedding_project record and binds the "
    "couple to a designated certified Wedding Planner."
)

add_sec_h2("3.2 Certified Planner Command Center")
add_p(
    "The Wedding Planner serves as the operational executive of the project. Within the Planner Dashboard, the planner inspects "
    "new customer intakes, manages requirement sheets, explores verified vendor catalogs by service taxonomy and city, and verifies "
    "real-time vendor availability before dispatching inquiries. Planners assemble curated proposal packages, negotiate quotes, "
    "coordinate contracts, track line-item budgets, and issue client approval requests."
)

add_sec_h2("3.3 Vendor Catalog & Dynamic Availability Engine")
add_p(
    "Specialized wedding vendors (e.g., pixel-perfect photographers, culinary banqueters, floral mandap stylists, sangeet DJs) "
    "manage detailed digital storefronts. Vendors configure service packages with itemized inclusions and base pricing, upload "
    "portfolio credentials, and maintain an interactive calendar. Dates can be flagged as 'AVAILABLE' or 'BLOCKED'. When a planner "
    "dispatches a request, the vendor reviews the offered quote and can either accept or decline with a mandatory rationale."
)

add_sec_h2("3.4 Enterprise Delegation & Booking Workflow")
add_p(
    "The core transaction engine links accepted vendor services into a formal Booking contract. When the planner arranges "
    "the assembled vendor package into a unified wedding proposal, the customer receives an alert to inspect the itemized "
    "proposal. The couple can either approve the proposal or request adjustments with notes. Upon client approval, the booking "
    "transitions into an escrow contract, locking all vendor slots into permanent reservation."
)

add_sec_h2("3.5 Milestone Financial Ledger & Automated GST Invoicing")
add_p(
    "To eliminate financial friction, the platform decomposes the total contracted wedding sum into three structured milestone "
    "installments: a 25% Advance Retainer (enabling venue booking and vendor commitment), a 50% Mid-Term Installment (due two weeks "
    "prior to ceremony execution for material procurement), and a 25% Final Settlement (released upon completion of post-wedding "
    "deliverables). The billing engine calculates 18% GST (9% CGST + 9% SGST), generating standardized commercial tax invoices."
)

add_sec_h2("3.6 Run-of-Show Scheduling & Document Vault")
add_p(
    "Successful wedding execution requires down-to-the-minute scheduling. The Wedding Schedule module provides a chronological "
    "run-of-show timeline for every ceremony event (e.g., Welcome Lunch, Sangeet, Muhurtham, Reception). Each event is linked to its "
    "designated venue, start/end timestamps, and assigned vendor points of contact. A secure Document Vault handles contracts, "
    "mandap blueprints, and safety permits with file validation."
)

add_sec_h2("3.7 Multi-Role Communication & Notification Hub")
add_p(
    "Direct communication channels bridge the planner with couples and vendors while strictly preserving role privacy. "
    "Real-time conversations feature unread message badges, timestamps, and message history. The notification service triggers "
    "automated in-app alerts whenever critical project events occur (e.g., proposal dispatched, vendor declined, payment due)."
)

add_sec_h2("3.8 AI Concierge & Executive Analytics")
add_p(
    "A floating AI concierge assistant is embedded across all authenticated screens. The chatbot parses user questions regarding "
    "wedding milestones, remaining budget, and assigned vendor details through database query helpers. Concurrently, executive "
    "analytics present metrics on active wedding portfolios, vendor acceptance ratios, and category expenditure breakdowns."
)

# =====================================================================
# CHAPTER 4: UML CLASS DIAGRAM
# =====================================================================
add_ch_title(4, "UML CLASS DIAGRAM")

add_p(
    "The domain model of the Wedding Planner and Vendor Coordination Platform is structured according to Object-Oriented "
    "Software Engineering (OOSE) principles. The architecture encapsulates state and business behaviors within dedicated "
    "domain entities while enforcing data isolation between user roles."
)

add_figure("fig_4_class_diagram.png", "Figure 4: Core Entity UML Class Diagram (WPVCP Domain Model)")

add_p(
    "The UML Class Diagram illustrated in Figure 4 depicts the structural relationships, class attributes, operational methods, "
    "and multiplicity constraints governing the platform. Key structural interactions include:"
)

add_bullet("User Base Entity", "Represents the global identity model containing authentication credentials (email, password_hash, auth_provider, google_id), activation flags, and a many-to-one association with Role.")
add_bullet("Role Profile Specialization", "Maintains 1:1 polymorphic extension relationships with Planner, Vendor, and Customer entities, ensuring role-specific attributes (e.g., agency_name, business_name, partner_name) remain decoupled.")
add_bullet("WeddingProject Aggregate Root", "Acts as the operational core of the system, binding exactly one Customer to an assigned certified Planner, while aggregating WeddingRequirement, VendorRequest, Booking, and WeddingSchedule entities.")
add_bullet("Booking & BookingService Hierarchy", "Represents the legal contract. Booking maintains a 1:N composition with BookingService line items, each referencing a specific Vendor and service catalog entry.")
add_bullet("Financial Decomposition", "Booking maintains a 1:3 relationship with Payment milestone entities (Advance 25%, Mid-Term 50%, Final 25%), which subsequently generate sequential Invoice tax documents.")

# =====================================================================
# CHAPTER 5: TABLE STRUCTURES
# =====================================================================
add_ch_title(5, "RELATIONAL TABLE STRUCTURES (DATA DICTIONARY)")

add_p(
    "The data tier of the Wedding Planner and Vendor Coordination Platform is implemented on MySQL 8.0, comprising 28 "
    "normalized tables structured in Third Normal Form (3NF). Every table incorporates primary keys, foreign key constraints "
    "with cascading integrity rules, indexes on frequently filtered foreign keys, and audit timestamps (created_at, updated_at). "
    "The following data dictionary provides the complete physical schema specification for all 28 tables."
)

table_descriptions = {
    "roles": "Defines the 4 core platform privilege tiers: ADMIN, PLANNER, VENDOR, and CUSTOMER.",
    "users": "Central authentication registry supporting local bcrypt password hashes and Google OAuth 2.0 IDs.",
    "planners": "Stores professional profiles, agency details, and experience credentials for certified wedding planners.",
    "service_categories": "Standardized taxonomy cataloging wedding services (Banqueting, Decor, Photography, DJ, Makeup, etc.).",
    "vendors": "Business profiles of verified third-party wedding partners, tracking ratings, cities, and categories.",
    "vendor_services": "Itemized service packages published by vendors, specifying base rates, durations, and inclusions.",
    "customers": "Profile registry of engaged couples, binding them to their assigned wedding planner and recording budget ceilings.",
    "wedding_projects": "The central operational entity encapsulating wedding dates, budget totals, and overall coordination lifecycle state.",
    "wedding_requirements": "Detailed customer intake specification capturing guest counts, aesthetic themes, catering rules, and notes.",
    "vendor_availability": "Dynamic calendar engine recording date-level slot statuses (AVAILABLE, BOOKED, BLOCKED) per vendor.",
    "vendor_requests": "Delegation hub tracking planner dispatch inquiries, offered quotes, vendor decisions, and decline reasons.",
    "bookings": "Binding legal contract governing accepted vendor assemblies, financial totals, and overall project status.",
    "booking_services": "Line-item breakdown of individual vendor services contracted under an approved wedding booking.",
    "payments": "Milestone escrow ledger decomposing booking amounts into 25% Advance, 50% Mid-Term, and 25% Final installments.",
    "payment_transactions": "Audit log recording payment gateway transaction references, methods, and reconciliation timestamps.",
    "invoices": "Formal commercial tax documents calculating 18% GST (CGST + SGST) and generating invoice sequence numbers.",
    "budgets": "Itemized financial ledger linking project budget caps with total allocated and disbursed vendor expenses.",
    "budget_items": "Category-wise expense breakdown tracking allocated vs actual spend per wedding service category.",
    "wedding_schedule": "Run-of-show ceremony timetable detailing event names, dates, times, venues, and assigned vendor contacts.",
    "documents": "Secure file repository indexing uploaded vendor contracts, mandap blueprints, and safety permits.",
    "conversations": "Discussion threads establishing isolated communication channels between planners, couples, and vendors.",
    "messages": "Real-time message payloads recording text content, sender/recipient IDs, timestamps, and read indicators.",
    "notifications": "In-app alert hub notifying users of critical workflow transitions, proposal reviews, and payment deadlines.",
    "reviews": "Post-ceremony feedback registry recording 1-to-5 star ratings and written testimonials for planners and vendors.",
    "wishlists": "Customer curation repository allowing couples to bookmark preferred vendor packages prior to formal dispatch.",
    "support_requests": "Helpdesk ticketing registry logging technical issues and customer service inquiries for resolution.",
    "chatbot_conversations": "Contextual session registry for the floating AI concierge tracking user queries.",
    "chatbot_messages": "Granular query-response log storing natural language interactions between users and the AI assistant."
}

tbl_counter = 1
for tname, cols in schema_metadata.items():
    add_sec_h3(f"Table 5.{tbl_counter}: {tname}")
    desc_txt = table_descriptions.get(tname, f"Physical relational storage for the {tname} domain entity.")
    add_p(desc_txt, italic=True, size=10.5, space_before=2, space_after=6)

    headers = ["Column Name", "Data Type", "Null", "Key", "Default", "Functional Description"]
    table_data = []
    for c in cols:
        col_name = c["name"]
        col_type = c["type"]
        is_null = c["null"]
        key = c["key"] if c["key"] else "-"
        default = c["default"] if c["default"] is not None else "NULL"
        if default == "": default = "None"
        
        func_desc = "Column attribute."
        if "id" in col_name and key == "PRI":
            func_desc = "Primary key surrogate identifier; auto-incremented."
        elif col_name.endswith("_id") or key == "MUL":
            ref = col_name.replace("_id", "")
            func_desc = f"Foreign key referencing parent `{ref}` entity."
        elif "status" in col_name:
            func_desc = "Workflow state machine indicator."
        elif "amount" in col_name or "price" in col_name or "budget" in col_name:
            func_desc = "Monetary value represented with exact precision."
        elif "date" in col_name or "time" in col_name or "at" in col_name:
            func_desc = "Temporal audit or event scheduling marker."
        elif "email" in col_name or "phone" in col_name:
            func_desc = "Unique contact or authentication communication channel."
        elif "name" in col_name or "title" in col_name:
            func_desc = "Human-readable descriptive label."
        elif "rating" in col_name:
            func_desc = "Numerical scoring metric (1.0 to 5.0 scale)."
        elif "text" in col_name or "bio" in col_name or "reason" in col_name or "notes" in col_name:
            func_desc = "Unbounded textual content or explanatory remarks."

        table_data.append([col_name, col_type, is_null, key, default, func_desc])

    add_styled_table(headers, table_data, col_widths=[1.4, 1.2, 0.5, 0.5, 0.7, 1.9], align_cols=['L', 'L', 'C', 'C', 'C', 'L'])
    tbl_counter += 1

# =====================================================================
# CHAPTER 6: ER DIAGRAM
# =====================================================================
add_ch_title(6, "ENTITY-RELATIONSHIP (ER) DIAGRAM")

add_p(
    "The Entity-Relationship (ER) diagram models the logical associations, cardinality constraints, and foreign key "
    "dependencies that govern the 28 normalized tables of the Wedding Planner and Vendor Coordination Platform. "
    "Referential integrity is maintained through foreign keys with ON DELETE CASCADE and ON DELETE RESTRICT rules."
)

add_figure("fig_6_er_diagram.png", "Figure 6: Relational Entity-Relationship Diagram (28 Normalized MySQL Tables)")

add_sec_h2("6.1 Relational Normalization & Integrity Analysis")
add_p(
    "The relational schema adheres to Third Normal Form (3NF) and Boyce-Codd Normal Form (BCNF) standards: "
    "all non-key attributes are fully functionally dependent on the primary key, and transitive dependencies are eliminated. "
    "For example, rather than embedding vendor categories as free-form strings inside the vendors table, a dedicated "
    "service_categories master entity is utilized, ensuring taxonomy consistency and enabling indexed filtering."
)

add_sec_h2("6.2 Cardinality & Structural Associations")
add_bullet("Users to Roles (N:1)", "Every user is strictly assigned to one of the 4 role records via role_id, establishing an immutable security foundation.")
add_bullet("Users to Profiles (1:1)", "Users specialize into exactly one profile entity: planners, vendors, or customers via unique foreign keys, ensuring table isolation.")
add_bullet("Projects to Requirements (1:1)", "Every wedding project maintains exactly one intake specification detailing guest count, budget, and aesthetic themes.")
add_bullet("Projects to Vendor Requests (1:N)", "A wedding project acts as a parent to multiple vendor inquiry dispatches, tracking individual vendor responses.")
add_bullet("Bookings to Booking Services (1:N)", "An approved booking decomposes into multiple service line items, locking contracted prices and vendor slots.")
add_bullet("Bookings to Milestone Payments (1:3)", "Each booking automatically instantiates 3 milestone payment records representing the 25%, 50%, and 25% tranches.")
add_bullet("Payments to Invoices (1:1)", "Every recorded milestone payment transaction is linked to an official tax invoice containing GST calculations.")

add_sec_h2("6.3 Indexing Strategy for High-Throughput Queries")
add_p(
    "To guarantee low read latency under peak planning loads, the database schema implements composite and B-Tree indexes: "
    "idx_users_role on users(role_id), idx_users_email on users(email), idx_availability_vendor_date on "
    "vendor_availability(vendor_id, date), and idx_requests_project_status on vendor_requests(wedding_project_id, status). "
    "These indexes ensure lookups remain O(log N) rather than incurring full table scans."
)

# =====================================================================
# CHAPTER 7: TECH STACK & SYSTEM ARCHITECTURE
# =====================================================================
add_ch_title(7, "TECH STACK & MULTI-TIER SYSTEM ARCHITECTURE")

add_sec_h2("7.1 Technical Stack Matrix")
add_p(
    "The Wedding Planner and Vendor Coordination Platform is built upon a modern, high-performance web engineering stack. "
    "The following matrix summarizes the architectural layers, selected technologies, and engineering rationale:"
)

tech_headers = ["Layer", "Technology", "Engineering Purpose & Selection Rationale"]
tech_data = [
    ["Frontend SPA", "React 18 (Vite)", "Fast declarative component rendering, virtual DOM reconciliation, and instant Hot Module Replacement (HMR)."],
    ["Routing Engine", "React Router v6", "Declarative client-side routing with nested layouts and role-based route protection guards."],
    ["HTTP Client", "Axios", "Promise-based HTTP client featuring automated request/response interceptors for JWT injection and token refresh."],
    ["Design Tokens", "Vanilla CSS", "Zero-runtime CSS custom properties (variables) providing responsive layouts, dark/light themes, and 4 font scales."],
    ["Iconography", "Lucide React", "Lightweight, tree-shakable SVG icon library delivering visual clarity across desktop and mobile screens."],
    ["Backend Runtime", "Node.js (v20+)", "Asynchronous, event-driven JavaScript runtime offering high I/O throughput for concurrent user interactions."],
    ["API Framework", "Express.js", "Minimalist, unopinionated web framework delivering structured REST routing and modular middleware pipelines."],
    ["Database Server", "MySQL 8.0", "Enterprise-grade relational database management system supporting ACID transactions, foreign keys, and indexes."],
    ["DB Connection", "mysql2/promise", "High-performance connection pooling utilizing native ES6 Promises for asynchronous non-blocking queries."],
    ["Authentication", "Bcrypt.js + JWT", "Salted password hashing (cost factor 10) coupled with 7-day stateless HMAC-SHA256 JSON Web Tokens."],
    ["OAuth 2.0", "google-auth-library", "Official Google Identity Services integration with account selection (prompt=select_account) and zero password exposure."],
    ["Security Gateway", "Helmet & Rate Limiter", "Sets HTTP security headers (CSP, HSTS) and enforces IP-level request throttling (100 req/15min) to prevent brute-force attacks."],
    ["File Storage", "Multer", "Multipart form-data middleware validating mime types and file sizes for PDF contracts and venue blueprints."],
    ["State Management", "React Context API", "Decentralized reactive stores: AuthContext, ThemeContext, LanguageContext, and ToastContext."]
]
add_styled_table(tech_headers, tech_data, col_widths=[1.3, 1.6, 3.3], align_cols=['L', 'L', 'L'])

add_sec_h2("7.2 Multi-Tier System Architecture")
add_p(
    "The platform adheres to an enterprise Multi-Tier / Layered MVC architectural topology. This guarantees separation "
    "of concerns between presentation, business orchestration, and persistent storage."
)

add_figure("fig_7_architecture.png", "Figure 7.2: Layered MVC & Secure Request-Response Pipeline")

add_p(
    "As detailed in Figure 7.2, the request-response lifecycle executes through four isolated tiers:"
)

add_bullet("1. Client Presentation Tier", "The React SPA maintains client state, captures user interactions, and dispatches HTTP requests via Axios with Bearer JWT tokens in Authorization headers.")
add_bullet("2. Security & Gateway Middleware", "Express routes requests through express-rate-limit (throttling abusive traffic), Helmet (securing headers), and authMiddleware (verifying JWT authenticity and decoding role claims).")
add_bullet("3. Business Logic & Controller Tier", "Dedicated REST controllers (e.g., bookingController, paymentController) execute business rules, validate request bodies, and orchestrate transactions.")
add_bullet("4. Relational Persistence Tier", "The mysql2 connection pool executes parameterized SQL statements against MySQL 8.0, enforcing referential integrity and returning structured result sets.")

# =====================================================================
# CHAPTER 8: MODULES
# =====================================================================
add_ch_title(8, "SYSTEM MODULES & DETAILED DESIGN")

add_sec_h2("8.0 Design Approach & Shared Sizing Baseline")
add_p(
    "To ensure architectural rigor across all functional areas, each module in this chapter is documented according "
    "to an 8-step engineering methodology:"
)

methodology_headers = ["Step", "Question It Answers", "Documentation Section"]
methodology_data = [
    ["1. Purpose & Scope", "What business problem does this module solve?", "Section 8.x.0"],
    ["2. Functional Requirements", "What exact operations must the module perform?", "Section 8.x.1"],
    ["3. Non-Functional Requirements", "How fast, reliable, secure, and accessible must it be?", "Section 8.x.2"],
    ["4. Tech Stack & Rationale", "Which tools and libraries suit this problem, and why?", "Section 8.x.3"],
    ["5. Sizing Baseline Estimation", "What are the data volumes, QPS, latency, and storage demands?", "Section 8.x.4"],
    ["6. Low-Level Architecture", "How do client, middleware, controllers, and DB interact?", "Section 8.x.5"],
    ["7. API Design", "What are the exact REST endpoints, payloads, and contracts?", "Section 8.x.6"],
    ["8. Database Design & UI", "Which tables store state, and how is the UI rendered?", "Section 8.x.7 & 8.x.8"]
]
add_styled_table(methodology_headers, methodology_data, col_widths=[1.5, 3.2, 1.5], align_cols=['L', 'L', 'L'])

add_sec_h3("Sizing Baseline Assumptions for the Wedding Platform")
add_p(
    "The engineering baselines below govern the capacity planning, concurrency models, and storage estimates for the system:"
)

sizing_headers = ["Metric / Parameter", "Production Baseline", "Operational Basis & Derivation"]
sizing_data = [
    ["Active Weddings Managed / Year", "≈ 500 weddings", "Mid-to-large regional wedding agency workload."],
    ["Concurrent Wedding Projects", "≈ 50 concurrent projects", "Active in various stages of planning at any given month."],
    ["Verified Partner Vendors", "≈ 250 registered vendors", "Spanning banquets, decor, photography, catering, DJ, makeup."],
    ["Customer Users (Couples)", "≈ 1,000 active users", "Couples, partners, and primary family decision-makers."],
    ["Requests per User per Day", "≈ 80 requests / user / day", "Requirements browsing, messaging, calendar checks, payments."],
    ["Daily Platform Requests", "≈ 100,000 requests / day", "Derived from 1,250 total users × 80 requests/day."],
    ["Peak Query Throughput (QPS)", "≈ 25 – 35 QPS", "Assumes 3x peak burst during evening planning hours."],
    ["Average Read Latency Target", "< 65 milliseconds", "Database lookups optimized via indexed foreign keys."],
    ["Average Write Latency Target", "< 150 milliseconds", "Multi-table atomic transactions for bookings and payments."],
    ["Annual Database Storage Growth", "≈ 450 MB / year", "Relational row data, audit logs, and message payloads (excluding media)."],
    ["Document Storage Growth", "≈ 25 GB / year", "PDF contracts, safety permits, and high-res mandap blueprints."]
]
add_styled_table(sizing_headers, sizing_data, col_widths=[1.8, 1.6, 2.8], align_cols=['L', 'L', 'L'])

add_figure("fig_8_0_request_flow.png", "Figure 8.0: Enterprise Delegation Protocol (Customer -> Planner -> Vendor -> Planner -> Customer)")

add_sec_h2("8.1 Project Directory Structure & Hierarchy")
add_p(
    "The codebase maintains a modular, decoupled repository organization structured into three primary subtrees: "
    "database/ for SQL schemas and seeds, backend/ for the Node/Express server, and frontend/ for the React 18 SPA."
)

add_figure("fig_8_1_1_project_tree.png", "Figure 8.1.1: Full-Stack Project Folder Hierarchy & Component Tree")

add_sec_h3("8.1.1 Database Subtree (database/)")
add_bullet("schema.sql", "Contains the complete DDL for all 28 tables, incorporating foreign key constraints, indexes, and utf8mb4 collation.")
add_bullet("seed.sql", "Pre-populates realistic enterprise demo data: 4 roles, 56 users, 45 vendors, 5 wedding projects, real conversations, and invoices.")
add_bullet("README.md", "Provides step-by-step instructions for database instantiation, user permissions, and connection testing.")

add_sec_h3("8.1.2 Backend Subtree (backend/)")
add_bullet("server.js", "Primary entry point initializing Express, mounting CORS, Helmet, rate limiters, static uploads, and all 20 REST routers.")
add_bullet("config/db.js", "Instantiates the mysql2 connection pool with environment variable configuration and connection error handlers.")
add_bullet("controllers/ (20 Files)", "Modular business controllers: authController, bookingController, budgetController, paymentController, vendorController, etc.")
add_bullet("middleware/", "authMiddleware (JWT verification), roleMiddleware (RBAC verification), rateLimitMiddleware, errorHandler.")
add_bullet("services/", "notificationService.js (in-app alerts dispatch) and chatbotController.js (database natural language query parser).")
add_bullet("uploads/docs/", "Local filesystem storage directory for validated user document uploads.")

add_sec_h3("8.1.3 Frontend Subtree (frontend/src/)")
add_bullet("main.jsx & App.jsx", "Application bootstrap mounting Context Providers (Auth, Theme, Lang, Toast) and declaring 40+ client routes.")
add_bullet("components/ (15+ Files)", "Reusable UI widgets: Navbar, Header, Footer, Chatbot, Modal, Badge, LoadingSkeleton, StatCards, EmptyState.")
add_bullet("context/ (5 Contexts)", "Global reactive state management: AuthContext, ThemeContext, LanguageContext, ToastContext, RecentlyAccessedContext.")
add_bullet("layouts/DashboardLayout.jsx", "Unified layout wrapper rendering top navigation, responsive sidebars, theme toggles, and breadcrumbs.")
add_bullet("pages/ (40+ Page Views)", "Role-segregated views: pages/auth/, pages/planner/, pages/vendor/, pages/customer/, and pages/common/.")
add_bullet("styles/index.css", "Central design tokens: 30+ CSS custom variables defining color palettes, spacing, shadows, and accessibility themes.")

for mod in modules_data:
    print(f"Writing BW Module {mod['id']}: {mod['title']}...")
    add_sec_h2(f"{mod['id']} {mod['title']}")

    # x.0 Purpose & Scope
    add_sec_h3(f"{mod['id']}.0 Purpose & Scope")
    add_p(mod["purpose"], space_after=8)

    # x.1 Functional Requirements
    add_sec_h3(f"{mod['id']}.1 Functional Requirements")
    add_p("What the module must do:")
    for req in mod["func_reqs"]:
        parts = req.split(":")
        if len(parts) == 2:
            add_bullet(parts[0].strip(), parts[1].strip())
        else:
            add_bullet("", req.strip())

    # x.2 Non-Functional Requirements
    add_sec_h3(f"{mod['id']}.2 Non-Functional Requirements")
    for nfr in mod["non_func_reqs"]:
        parts = nfr.split(":")
        if len(parts) == 2:
            add_bullet(parts[0].strip(), parts[1].strip())
        else:
            add_bullet("", nfr.strip())

    # x.3 Tech Stack & Rationale
    add_sec_h3(f"{mod['id']}.3 Tech Stack & Architectural Fit")
    ts_headers = ["Concern / Requirement", "Choice", "Why It Fits This Module"]
    add_styled_table(ts_headers, mod["tech_stack"], col_widths=[1.5, 1.5, 3.2], align_cols=['L', 'L', 'L'])

    # x.4 Back-of-the-Envelope Estimation
    add_sec_h3(f"{mod['id']}.4 Back-of-the-Envelope Estimation")
    sizing_headers = ["Quantity / Resource", "Estimate", "Operational Basis & Derivation"]
    add_styled_table(sizing_headers, mod["sizing"], col_widths=[1.8, 1.4, 3.0], align_cols=['L', 'L', 'L'])

    # x.5 Low-Level Architecture & Request Flow
    add_sec_h3(f"{mod['id']}.5 Low-Level Architecture & Execution Flow")
    add_figure(mod["arch_fig"], mod["arch_caption"])
    add_p("Request flow:")
    for idx, step in enumerate(mod["request_flow"], 1):
        add_bullet(f"Step {idx}", step)

    # x.6 API Design
    add_sec_h3(f"{mod['id']}.6 REST API Design & Contracts")
    api_headers = ["Method", "Endpoint Route", "Access Level", "Purpose & Contract Specification"]
    add_styled_table(api_headers, mod["api_table"], col_widths=[0.8, 2.0, 1.1, 2.3], align_cols=['C', 'L', 'C', 'L'])

    # x.7 Database Design
    add_sec_h3(f"{mod['id']}.7 Database Design & Entity Schemas")
    db_headers = ["Table", "Keys & Constraints", "Key Columns & Schema Definition"]
    add_styled_table(db_headers, mod["db_table"], col_widths=[1.4, 2.0, 2.8], align_cols=['L', 'L', 'L'])

    # x.8 UI Design & Visual Layouts
    add_sec_h3(f"{mod['id']}.8 User Interface Design & Visual Renders")
    add_figure(mod["ui_fig"], mod["ui_caption"])
    add_p(mod["ui_desc"], space_before=4, space_after=12)

# =====================================================================
# CHAPTER 9: CONCLUSION
# =====================================================================
add_ch_title(9, "CONCLUSION & FUTURE ENHANCEMENTS")

add_sec_h2("9.1 Project Summary & Achievements")
add_p(
    "The Wedding Planner and Vendor Coordination Platform (WPVCP) — Vows & Veils Enterprise Suite — successfully establishes "
    "a production-ready, full-stack digital solution for the modern event and wedding management industry. By formally implementing "
    "the five-phase enterprise delegation protocol (Customer -> Planner -> Vendor -> Planner -> Customer), the platform successfully "
    "bridges the operational divide between engaged couples, professional planners, and third-party vendors."
)

add_p("The principal accomplishments achieved during the design and development lifecycle include:")
add_bullet("Full-Stack Architectural Realization", "Engineered a decoupled, responsive single-page application using React 18 and Vite, backed by an Express.js REST API and connection-pooled MySQL 8.0 database.")
add_bullet("Normalized Relational Schema", "Designed and implemented 28 normalized database tables adhering to Third Normal Form (3NF), complete with foreign key cascade rules, composite indexes, and strict data isolation.")
add_bullet("Dual-Channel Authentication Security", "Integrated seamless one-click Google OAuth 2.0 with prompt=select_account alongside salted Bcrypt password hashing, stateless 7-day JWT tokens, and rate-limiting middleware.")
add_bullet("Real-Time Vendor Date Locking", "Constructed an interactive vendor availability calendar engine that dynamically prevents double bookings by automatically locking contracted dates upon client proposal approval.")
add_bullet("Automated Milestone Financials & GST Billing", "Implemented a structured 25%/50%/25% milestone escrow ledger, calculating 18% GST and generating standardized, printable commercial tax invoices.")
add_bullet("Comprehensive Accessibility & Localization", "Equipped the frontend with high-contrast Light/Dark themes, 4 dynamic font size scalers (S/M/L/XL), and a comprehensive 6-language translation dictionary (English, Tamil, Hindi, Malayalam, Telugu, Kannada).")
add_bullet("Contextual AI Concierge Integration", "Embedded an intelligent conversational assistant capable of querying live database entities in natural language to answer couple and planner inquiries.")

add_sec_h2("9.2 Verification & Testing Results")
add_p(
    "The platform underwent rigorous end-to-end integration and load testing using automated test suites. All 56 seeded test "
    "accounts across Planners, Vendors, and Customers verified successful authentication, role-based route protection, "
    "proposal dispatches, milestone payment recordings, and document uploads without regression."
)

add_sec_h2("9.3 Roadmap for Future Enhancements")
add_p(
    "While the current release provides an exhaustive enterprise foundation, the following roadmap features are scheduled "
    "for subsequent development phases:"
)
add_bullet("1. Real-Time Escrow Payment Gateway", "Integrate official Razorpay / Stripe Escrow APIs to hold milestone funds in automated escrow accounts, releasing tranches upon mutual digital sign-off.")
add_bullet("2. Augmented Reality (AR) Mandap Visualizer", "Incorporate WebXR / Three.js 3D venue layout visualizers, allowing couples to project mandap, floral stage, and seating designs onto venue floorplans.")
add_bullet("3. Native Cross-Platform Mobile Applications", "Package the client using React Native / Capacitor to provide couples and vendors with push notifications, offline run-of-show timetables, and mobile check-ins.")
add_bullet("4. Automated WhatsApp & SMS Dispatch Hub", "Connect Twilio / Gupshup WhatsApp Business APIs to dispatch automated ceremony schedule reminders, RSVP links, and payment receipts directly to wedding guests.")
add_bullet("5. Advanced Predictive Budgeting AI", "Deploy machine learning models analyzing historical vendor pricing trends across seasons and destination cities to provide couples with automated cost-optimization recommendations.")

# =====================================================================
# SAFE SAVE
# =====================================================================
print(f"Saving BW document to: {OUTPUT_PATH_1}")
doc.save(OUTPUT_PATH_1)

print(f"Saving BW document to: {OUTPUT_PATH_2}")
doc.save(OUTPUT_PATH_2)

print(f"Saving BW document to workspace root: {WORKSPACE_OUTPUT}")
doc.save(WORKSPACE_OUTPUT)

try:
    doc.save(LOCKED_FILE)
    print(f"Also updated: {LOCKED_FILE}")
except Exception as e:
    print(f"Note: {LOCKED_FILE} is currently open in Word. Saved to {OUTPUT_PATH_1} and {OUTPUT_PATH_2} successfully.")

print("All black and white report documents generated successfully!")
