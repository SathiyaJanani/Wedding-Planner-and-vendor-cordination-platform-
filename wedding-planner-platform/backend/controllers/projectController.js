const { query } = require('../config/db');
const { createNotification } = require('../services/notificationService');
const { parsePagination, buildPaginationResponse, buildOrderBy } = require('../utils/queryHelper');

// Get all wedding projects (Planner)
async function getAllProjects(req, res) {
  try {
    const { status, search, city, sort_by } = req.query;
    const { page, limit, offset, isExplicit } = parsePagination(req.query, 10, 100);

    let baseFromWhere = `
      FROM wedding_projects wp
      JOIN customers c ON wp.customer_id = c.id
      JOIN users u ON c.user_id = u.id
      JOIN planners p ON wp.planner_id = p.id
      LEFT JOIN bookings b ON b.wedding_project_id = wp.id
      WHERE 1=1
    `;
    const params = [];

    if (req.user.role_name === 'VENDOR') {
      const vendorId = req.user.vendor_id || 0;
      baseFromWhere += ` AND (
        wp.id IN (
          SELECT b2.wedding_project_id 
          FROM bookings b2 
          JOIN booking_services bs2 ON bs2.booking_id = b2.id 
          WHERE bs2.vendor_id = ?
        )
        OR wp.id IN (
          SELECT vr2.wedding_project_id 
          FROM vendor_requests vr2 
          WHERE vr2.vendor_id = ?
        )
      )`;
      params.push(vendorId, vendorId);
    } else if (req.user.role_name === 'CUSTOMER') {
      baseFromWhere += ` AND wp.customer_id = ?`;
      params.push(req.user.customer_id || 0);
    }

    if (status) {
      baseFromWhere += ` AND wp.status = ?`;
      params.push(status);
    }

    if (city) {
      baseFromWhere += ` AND wp.city = ?`;
      params.push(city);
    }

    if (search) {
      baseFromWhere += ` AND (wp.title LIKE ? OR wp.project_code LIKE ? OR u.full_name LIKE ? OR c.partner_name LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    // 1. Get total count
    const [countRows] = await query(`SELECT COUNT(*) AS total ${baseFromWhere}`, params);
    const totalCount = countRows[0]?.total || 0;

    // 2. Sorting
    const sortMap = {
      date_asc: 'wp.wedding_date ASC',
      date_desc: 'wp.wedding_date DESC',
      budget_desc: 'wp.total_budget DESC',
      budget_asc: 'wp.total_budget ASC',
      title_asc: 'wp.title ASC',
      newest: 'wp.id DESC'
    };
    const orderClause = buildOrderBy(sort_by, sortMap, 'wp.wedding_date ASC');

    // 3. Selection query
    let selectSql = `
      SELECT wp.*,
             c.partner_name, c.wedding_theme,
             u.full_name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
             p.agency_name AS planner_agency,
             b.id AS booking_id, b.status AS booking_status, b.total_amount, b.paid_amount,
             (SELECT COUNT(*) FROM booking_services WHERE booking_id = b.id) AS vendor_count
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
    console.error('[getAllProjects Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve projects.' });
  }
}

// Get project details by ID
async function getProjectById(req, res) {
  try {
    const { id } = req.params;

    const [pRows] = await query(
      `SELECT wp.*,
              c.id AS customer_id, c.partner_name, c.wedding_theme, c.guest_count AS cust_guest_count,
              u.id AS customer_user_id, u.full_name AS customer_name, u.email AS customer_email, u.phone AS customer_phone, u.avatar_url AS customer_avatar,
              p.id AS planner_id, p.agency_name AS planner_agency,
              pu.full_name AS planner_name, pu.email AS planner_email, pu.phone AS planner_phone,
              b.id AS booking_id, b.booking_code, b.status AS booking_status, b.total_amount, b.advance_amount, b.paid_amount
       FROM wedding_projects wp
       JOIN customers c ON wp.customer_id = c.id
       JOIN users u ON c.user_id = u.id
       JOIN planners p ON wp.planner_id = p.id
       JOIN users pu ON p.user_id = pu.id
       LEFT JOIN bookings b ON b.wedding_project_id = wp.id
       WHERE wp.id = ?`,
      [id]
    );

    if (pRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const project = pRows[0];

    // Fetch booking services & arranged vendors
    if (project.booking_id) {
      const [services] = await query(
        `SELECT bs.*, v.business_name, v.city AS vendor_city, v.rating AS vendor_rating,
                u.full_name AS vendor_contact, u.email AS vendor_email, u.phone AS vendor_phone,
                vr.request_code, vr.status AS request_status, vr.decline_reason
         FROM booking_services bs
         JOIN vendors v ON bs.vendor_id = v.id
         JOIN users u ON v.user_id = u.id
         LEFT JOIN vendor_requests vr ON bs.vendor_request_id = vr.id
         WHERE bs.booking_id = ?`,
        [project.booking_id]
      );
      project.arranged_services = services;
    } else {
      project.arranged_services = [];
    }

    // Fetch budget & budget items
    const [budgets] = await query('SELECT * FROM budgets WHERE wedding_project_id = ?', [id]);
    if (budgets.length > 0) {
      project.budget = budgets[0];
      const [items] = await query(
        `SELECT bi.*, sc.name AS category_name
         FROM budget_items bi
         LEFT JOIN service_categories sc ON bi.category_id = sc.id
         WHERE bi.budget_id = ?`,
        [budgets[0].id]
      );
      project.budget.items = items;
    }

    // Fetch schedule
    const [schedule] = await query(
      `SELECT ws.*, v.business_name AS assigned_vendor_name
       FROM wedding_schedule ws
       LEFT JOIN vendors v ON ws.vendor_id = v.id
       WHERE ws.wedding_project_id = ?
       ORDER BY ws.event_date ASC, ws.start_time ASC`,
      [id]
    );
    project.schedule = schedule;

    // Fetch documents
    const [documents] = await query(
      `SELECT d.*, u.full_name AS uploader_name
       FROM documents d
       JOIN users u ON d.uploader_id = u.id
       WHERE d.wedding_project_id = ? AND d.status = 'ACTIVE'`,
      [id]
    );
    project.documents = documents;

    return res.json({ success: true, data: project });
  } catch (error) {
    console.error('[getProjectById Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve project details.' });
  }
}

// Create new project
async function createProject(req, res) {
  try {
    const { customer_id, title, wedding_date, venue_name, venue_address, city, guest_count, total_budget, notes } = req.body;

    if (!customer_id || !title || !wedding_date || !total_budget) {
      return res.status(400).json({ success: false, message: 'Customer ID, title, wedding date, and total budget are required.' });
    }

    const plannerId = req.user.planner_id || 1;
    const projectCode = `WP-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900))}`;

    const [pResult] = await query(
      `INSERT INTO wedding_projects (project_code, customer_id, planner_id, title, wedding_date, venue_name, venue_address, city, guest_count, total_budget, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PLANNING', ?)`,
      [projectCode, customer_id, plannerId, title, wedding_date, venue_name || null, venue_address || null, city || 'Bangalore', guest_count || 300, parseFloat(total_budget), notes || null]
    );

    const projectId = pResult.insertId;

    // Initialize Budget record
    await query(
      `INSERT INTO budgets (wedding_project_id, total_budget, allocated_amount, spent_amount, remaining_amount)
       VALUES (?, ?, 0.00, 0.00, ?)`,
      [projectId, parseFloat(total_budget), parseFloat(total_budget)]
    );

    // Initialize Booking record
    const bookingCode = `BK-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900))}`;
    await query(
      `INSERT INTO bookings (booking_code, wedding_project_id, customer_id, planner_id, total_amount, advance_amount, paid_amount, status)
       VALUES (?, ?, ?, ?, 0.00, 0.00, 0.00, 'DRAFT')`,
      [bookingCode, projectId, customer_id, plannerId]
    );

    return res.status(201).json({
      success: true,
      message: 'Wedding project created successfully.',
      project_id: projectId,
      project_code: projectCode
    });
  } catch (error) {
    console.error('[createProject Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to create project.' });
  }
}

// Update project
async function updateProject(req, res) {
  try {
    const { id } = req.params;
    const { title, wedding_date, venue_name, venue_address, city, guest_count, total_budget, status, notes } = req.body;

    await query(
      `UPDATE wedding_projects SET
        title = COALESCE(?, title),
        wedding_date = COALESCE(?, wedding_date),
        venue_name = COALESCE(?, venue_name),
        venue_address = COALESCE(?, venue_address),
        city = COALESCE(?, city),
        guest_count = COALESCE(?, guest_count),
        total_budget = COALESCE(?, total_budget),
        status = COALESCE(?, status),
        notes = COALESCE(?, notes)
       WHERE id = ?`,
      [title, wedding_date, venue_name, venue_address, city, guest_count, total_budget, status, notes, id]
    );

    // If budget updated, update budgets table
    if (total_budget) {
      await query(
        `UPDATE budgets SET total_budget = ?, remaining_amount = ? - spent_amount WHERE wedding_project_id = ?`,
        [parseFloat(total_budget), parseFloat(total_budget), id]
      );
    }

    return res.json({ success: true, message: 'Wedding project updated successfully.' });
  } catch (error) {
    console.error('[updateProject Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update project.' });
  }
}

// Customer get own active wedding project
async function getCustomerProject(req, res) {
  try {
    const [cRows] = await query('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
    if (cRows.length === 0) return res.status(404).json({ success: false, message: 'Customer record not found.' });

    const customerId = cRows[0].id;
    const [pRows] = await query('SELECT id FROM wedding_projects WHERE customer_id = ? ORDER BY id DESC LIMIT 1', [customerId]);

    if (pRows.length === 0) {
      return res.json({ success: true, data: null, message: 'No wedding project created yet. Please submit your wedding requirements.' });
    }

    // Call getProjectById internal logic
    req.params.id = pRows[0].id;
    return getProjectById(req, res);
  } catch (error) {
    console.error('[getCustomerProject Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch customer project.' });
  }
}

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  getCustomerProject
};
