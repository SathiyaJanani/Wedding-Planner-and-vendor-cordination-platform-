const { query } = require('../config/db');
const { parsePagination, buildPaginationResponse, buildOrderBy } = require('../utils/queryHelper');

// Get all invoices (Planner, Vendor, or Customer)
async function getInvoices(req, res) {
  try {
    const { status, booking_id, search, sort_by } = req.query;
    const { page, limit, offset, isExplicit } = parsePagination(req.query, 10, 100);

    let baseFromWhere = `
      FROM invoices i
      JOIN bookings b ON i.booking_id = b.id
      JOIN wedding_projects wp ON b.wedding_project_id = wp.id
      JOIN users iu ON i.issuer_id = iu.id
      JOIN users ru ON i.recipient_id = ru.id
      LEFT JOIN payments p ON i.payment_id = p.id
      LEFT JOIN payment_transactions pt ON pt.payment_id = p.id
      WHERE 1=1
    `;
    const params = [];

    // Filter by role
    if (req.user.role_name === 'CUSTOMER') {
      baseFromWhere += ` AND i.recipient_id = ?`;
      params.push(req.user.id);
    } else if (req.user.role_name === 'VENDOR') {
      // Vendor sees invoices where their services are invoiced
      baseFromWhere += ` AND i.booking_id IN (SELECT booking_id FROM booking_services WHERE vendor_id = ?)`;
      params.push(req.user.vendor_id || 0);
    }

    if (status) {
      baseFromWhere += ` AND i.status = ?`;
      params.push(status);
    }

    if (booking_id) {
      baseFromWhere += ` AND i.booking_id = ?`;
      params.push(booking_id);
    }

    if (search) {
      baseFromWhere += ` AND (i.invoice_number LIKE ? OR wp.title LIKE ? OR wp.project_code LIKE ? OR iu.full_name LIKE ? OR ru.full_name LIKE ? OR p.title LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term, term, term);
    }

    // 1. Total count
    const [countRows] = await query(`SELECT COUNT(*) AS total ${baseFromWhere}`, params);
    const totalCount = countRows[0]?.total || 0;

    // 2. Sorting
    const sortMap = {
      newest: 'i.created_at DESC',
      oldest: 'i.created_at ASC',
      amount_desc: 'i.total_amount DESC',
      amount_asc: 'i.total_amount ASC',
      due_date_asc: 'i.due_date ASC',
      due_date_desc: 'i.due_date DESC'
    };
    const orderClause = buildOrderBy(sort_by, sortMap, 'i.created_at DESC');

    // 3. Selection query
    let selectSql = `
      SELECT i.*,
             b.booking_code,
             wp.project_code, wp.title AS project_title, wp.wedding_date,
             iu.full_name AS issuer_name, iu.email AS issuer_email,
             ru.full_name AS recipient_name, ru.email AS recipient_email,
             p.title AS payment_title, p.milestone_name,
             pt.transaction_reference, pt.payment_method
      ${baseFromWhere}
      ${orderClause}
    `;

    let rows;
    if (isExplicit) {
      selectSql += ` LIMIT ? OFFSET ?`;
      [rows] = await query(selectSql, [...params, limit, offset]);
    } else {
      [rows] = await query(selectSql, params);
    }

    return res.json(buildPaginationResponse(rows, totalCount, page, isExplicit ? limit : (rows.length || 1)));

  } catch (error) {
    console.error('[getInvoices Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve invoices.' });
  }
}

// Get invoice by ID
async function getInvoiceById(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await query(
      `SELECT i.*,
              b.booking_code, b.total_amount AS booking_total,
              wp.project_code, wp.title AS project_title, wp.wedding_date, wp.venue_name, wp.venue_address,
              iu.full_name AS issuer_name, iu.email AS issuer_email, iu.phone AS issuer_phone,
              ru.full_name AS recipient_name, ru.email AS recipient_email, ru.phone AS recipient_phone,
              p.title AS payment_title, p.milestone_name,
              pt.transaction_reference, pt.payment_method, pt.paid_at
       FROM invoices i
       JOIN bookings b ON i.booking_id = b.id
       JOIN wedding_projects wp ON b.wedding_project_id = wp.id
       JOIN users iu ON i.issuer_id = iu.id
       JOIN users ru ON i.recipient_id = ru.id
       LEFT JOIN payments p ON i.payment_id = p.id
       LEFT JOIN payment_transactions pt ON pt.payment_id = p.id
       WHERE i.id = ?`,
      [id]
    );

    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Invoice not found.' });

    const invoice = rows[0];

    // Fetch itemized booking services for the invoice
    const [items] = await query(
      `SELECT service_name, category_name, agreed_price FROM booking_services WHERE booking_id = ?`,
      [invoice.booking_id]
    );
    invoice.items = items;

    return res.json({ success: true, data: invoice });

  } catch (error) {
    console.error('[getInvoiceById Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve invoice details.' });
  }
}

module.exports = {
  getInvoices,
  getInvoiceById
};
