const { query } = require('../config/db');
const { parsePagination, buildPaginationResponse, buildOrderBy } = require('../utils/queryHelper');

// Get schedule events for a project
async function getProjectSchedule(req, res) {
  try {
    const { projectId } = req.params;

    const [rows] = await query(
      `SELECT ws.*, v.business_name AS vendor_name, sc.name AS category_name
       FROM wedding_schedule ws
       LEFT JOIN vendors v ON ws.vendor_id = v.id
       LEFT JOIN service_categories sc ON v.category_id = sc.id
       WHERE ws.wedding_project_id = ?
       ORDER BY ws.event_date ASC, ws.start_time ASC`,
      [projectId]
    );

    return res.json({ success: true, count: rows.length, data: rows });

  } catch (error) {
    console.error('[getProjectSchedule Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve schedule.' });
  }
}

// Customer get own schedule
async function getCustomerSchedule(req, res) {
  try {
    const [cRows] = await query('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
    if (cRows.length === 0) return res.status(404).json({ success: false, message: 'Customer record not found.' });

    const [pRows] = await query('SELECT id FROM wedding_projects WHERE customer_id = ? ORDER BY id DESC LIMIT 1', [cRows[0].id]);
    if (pRows.length === 0) {
      return res.json({ success: true, data: [], message: 'No wedding project found for customer.' });
    }

    req.params.projectId = pRows[0].id;
    return getProjectSchedule(req, res);

  } catch (error) {
    console.error('[getCustomerSchedule Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve customer schedule.' });
  }
}

// Vendor get own schedule
async function getVendorSchedule(req, res) {
  try {
    const vendorId = req.user.vendor_id;
    if (!vendorId) return res.status(403).json({ success: false, message: 'Vendor profile not found.' });

    const [rows] = await query(
      `SELECT ws.*, wp.title AS project_title, wp.venue_name, wp.venue_address, wp.city
       FROM wedding_schedule ws
       JOIN wedding_projects wp ON ws.wedding_project_id = wp.id
       WHERE ws.vendor_id = ?
       ORDER BY ws.event_date ASC, ws.start_time ASC`,
      [vendorId]
    );

    return res.json({ success: true, count: rows.length, data: rows });

  } catch (error) {
    console.error('[getVendorSchedule Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve vendor schedule.' });
  }
}

// Add schedule event (Planner)
async function addScheduleEvent(req, res) {
  try {
    const { wedding_project_id, event_title, event_date, start_time, end_time, location, description, person_in_charge, vendor_id, status } = req.body;

    if (!wedding_project_id || !event_title || !event_date || !start_time || !end_time) {
      return res.status(400).json({ success: false, message: 'Project ID, event title, date, start time, and end time are required.' });
    }

    const [result] = await query(
      `INSERT INTO wedding_schedule (wedding_project_id, event_title, event_date, start_time, end_time, location, description, person_in_charge, vendor_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [wedding_project_id, event_title, event_date, start_time, end_time, location || null, description || null, person_in_charge || null, vendor_id || null, status || 'SCHEDULED']
    );

    return res.status(201).json({
      success: true,
      message: 'Schedule event created successfully.',
      event_id: result.insertId
    });

  } catch (error) {
    console.error('[addScheduleEvent Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to add schedule event.' });
  }
}

// Update schedule event
async function updateScheduleEvent(req, res) {
  try {
    const { id } = req.params;
    const { event_title, event_date, start_time, end_time, location, description, person_in_charge, vendor_id, status } = req.body;

    await query(
      `UPDATE wedding_schedule SET
        event_title = COALESCE(?, event_title),
        event_date = COALESCE(?, event_date),
        start_time = COALESCE(?, start_time),
        end_time = COALESCE(?, end_time),
        location = COALESCE(?, location),
        description = COALESCE(?, description),
        person_in_charge = COALESCE(?, person_in_charge),
        vendor_id = COALESCE(?, vendor_id),
        status = COALESCE(?, status)
       WHERE id = ?`,
      [event_title, event_date, start_time, end_time, location, description, person_in_charge, vendor_id, status, id]
    );

    return res.json({ success: true, message: 'Schedule event updated successfully.' });

  } catch (error) {
    console.error('[updateScheduleEvent Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update schedule event.' });
  }
}

// Delete schedule event
async function deleteScheduleEvent(req, res) {
  try {
    const { id } = req.params;
    await query('DELETE FROM wedding_schedule WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Schedule event deleted successfully.' });
  } catch (error) {
    console.error('[deleteScheduleEvent Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete schedule event.' });
  }
}

// Get all schedule events across projects for Planner (Section 10)
async function getAllSchedules(req, res) {
  try {
    const { wedding_project_id, date, status, category_id, search, sort_by } = req.query;
    const { page, limit, offset, isExplicit } = parsePagination(req.query, 10, 50);

    let baseFromWhere = `
      FROM wedding_schedule ws
      JOIN wedding_projects wp ON ws.wedding_project_id = wp.id
      JOIN customers c ON wp.customer_id = c.id
      JOIN users cu ON c.user_id = cu.id
      LEFT JOIN vendors v ON ws.vendor_id = v.id
      LEFT JOIN service_categories sc ON v.category_id = sc.id
      LEFT JOIN users vu ON v.user_id = vu.id
      WHERE 1=1
    `;
    const params = [];

    if (wedding_project_id) {
      baseFromWhere += ` AND ws.wedding_project_id = ?`;
      params.push(wedding_project_id);
    }

    if (date) {
      baseFromWhere += ` AND ws.event_date = ?`;
      params.push(date);
    }

    if (status) {
      baseFromWhere += ` AND ws.status = ?`;
      params.push(status);
    }

    if (category_id) {
      baseFromWhere += ` AND sc.id = ?`;
      params.push(category_id);
    }

    if (search) {
      baseFromWhere += ` AND (
        cu.full_name LIKE ? OR 
        v.business_name LIKE ? OR 
        ws.event_title LIKE ? OR 
        wp.title LIKE ? OR 
        sc.name LIKE ?
      )`;
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }

    const [countRows] = await query(`SELECT COUNT(*) AS total ${baseFromWhere}`, params);
    const totalCount = countRows[0]?.total || 0;

    const sortMap = {
      date_asc: 'ws.event_date ASC, ws.start_time ASC',
      date_desc: 'ws.event_date DESC, ws.start_time DESC',
      customer_asc: 'cu.full_name ASC',
      customer_desc: 'cu.full_name DESC',
      vendor_asc: 'v.business_name ASC',
      vendor_desc: 'v.business_name DESC',
      service_asc: 'ws.event_title ASC',
      service_desc: 'ws.event_title DESC'
    };
    const orderClause = buildOrderBy(sort_by, sortMap, 'ws.event_date ASC, ws.start_time ASC');

    let selectSql = `
      SELECT ws.*,
             wp.project_code, wp.title AS project_title, wp.wedding_date AS project_wedding_date, wp.city AS project_city,
             c.id AS customer_id, c.partner_name, cu.full_name AS customer_name, cu.email AS customer_email, cu.phone AS customer_phone,
             v.business_name AS vendor_name, v.city AS vendor_city,
             sc.id AS category_id, sc.name AS category_name,
             vu.full_name AS vendor_contact, vu.phone AS vendor_phone
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
    console.error('[getAllSchedules Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve schedule.' });
  }
}

module.exports = {
  getProjectSchedule,
  getCustomerSchedule,
  getVendorSchedule,
  addScheduleEvent,
  updateScheduleEvent,
  deleteScheduleEvent,
  getAllSchedules
};
