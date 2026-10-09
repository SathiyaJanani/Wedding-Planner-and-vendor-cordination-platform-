const { query } = require('../config/db');
const { parsePagination, buildPaginationResponse, buildOrderBy } = require('../utils/queryHelper');

// Get all service categories with search, sort, pagination
async function getCategories(req, res) {
  try {
    const { search, sort_by } = req.query;
    const { page, limit, offset, isExplicit } = parsePagination(req.query, 20, 100);

    let baseFromWhere = `FROM service_categories WHERE is_active = TRUE`;
    const params = [];

    if (search) {
      baseFromWhere += ` AND (name LIKE ? OR description LIKE ? OR slug LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    const [countRows] = await query(`SELECT COUNT(*) AS total ${baseFromWhere}`, params);
    const totalCount = countRows[0]?.total || 0;

    const sortMap = {
      name_asc: 'name ASC',
      name_desc: 'name DESC',
      id_asc: 'id ASC',
      id_desc: 'id DESC'
    };
    const orderClause = buildOrderBy(sort_by, sortMap, 'name ASC');

    let selectSql = `SELECT * ${baseFromWhere} ${orderClause}`;
    let rows;
    if (isExplicit) {
      selectSql += ` LIMIT ? OFFSET ?`;
      [rows] = await query(selectSql, [...params, limit, offset]);
    } else {
      [rows] = await query(selectSql, params);
    }

    return res.json(buildPaginationResponse(rows, totalCount, page, isExplicit ? limit : (rows.length || 1)));
  } catch (error) {
    console.error('[getCategories Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
}

// Get vendors directory with filters (Search, category, price range, city, sorting, pagination)
async function getVendors(req, res) {
  try {
    const { category_id, category_slug, city, search, min_price, max_price, sort_by } = req.query;
    const { page, limit, offset, isExplicit } = parsePagination(req.query, 12, 100);

    let baseFromWhere = `
      FROM vendors v
      JOIN service_categories sc ON v.category_id = sc.id
      JOIN users u ON v.user_id = u.id
      WHERE u.is_active = TRUE
    `;
    const params = [];

    if (category_id) {
      baseFromWhere += ` AND v.category_id = ?`;
      params.push(category_id);
    }

    if (category_slug) {
      baseFromWhere += ` AND sc.slug = ?`;
      params.push(category_slug);
    }

    if (city) {
      baseFromWhere += ` AND v.city = ?`;
      params.push(city);
    }

    if (search) {
      baseFromWhere += ` AND (v.business_name LIKE ? OR v.description LIKE ? OR sc.name LIKE ? OR v.city LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (min_price) {
      baseFromWhere += ` AND v.base_price >= ?`;
      params.push(parseFloat(min_price));
    }

    if (max_price) {
      baseFromWhere += ` AND v.base_price <= ?`;
      params.push(parseFloat(max_price));
    }

    // 1. Get total count for pagination
    const [countRows] = await query(`SELECT COUNT(*) AS total ${baseFromWhere}`, params);
    const totalCount = countRows[0]?.total || 0;

    // 2. Sorting
    const sortMap = {
      price_asc: 'v.base_price ASC',
      price_desc: 'v.base_price DESC',
      rating: 'v.rating DESC, v.total_reviews DESC',
      rating_desc: 'v.rating DESC, v.total_reviews DESC',
      name_asc: 'v.business_name ASC',
      newest: 'v.id DESC'
    };
    const orderClause = buildOrderBy(sort_by, sortMap, 'v.rating DESC, v.id ASC');

    // 3. Query with or without pagination
    let selectSql = `
      SELECT v.*, sc.name AS category_name, sc.slug AS category_slug, sc.icon AS category_icon,
             u.full_name AS contact_name, u.email, u.phone, u.avatar_url
      ${baseFromWhere}
      ${orderClause}
    `;

    let rows;
    if (isExplicit) {
      selectSql += ` LIMIT ? OFFSET ?`;
      const pagedParams = [...params, limit, offset];
      [rows] = await query(selectSql, pagedParams);
    } else {
      [rows] = await query(selectSql, params);
    }

    return res.json(buildPaginationResponse(rows, totalCount, page, isExplicit ? limit : (rows.length || 1)));
  } catch (error) {
    console.error('[getVendors Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve vendors.' });
  }
}

// Get vendor by ID with services & recent reviews
async function getVendorById(req, res) {
  try {
    const { id } = req.params;

    const [vRows] = await query(
      `SELECT v.*, sc.name AS category_name, sc.slug AS category_slug, sc.icon AS category_icon,
              u.full_name AS contact_name, u.email, u.phone, u.avatar_url
       FROM vendors v
       JOIN service_categories sc ON v.category_id = sc.id
       JOIN users u ON v.user_id = u.id
       WHERE v.id = ?`,
      [id]
    );

    if (vRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Vendor not found.' });
    }

    const vendor = vRows[0];

    // Fetch vendor catalog services
    const [services] = await query(
      `SELECT * FROM vendor_services WHERE vendor_id = ? AND is_active = TRUE ORDER BY price ASC`,
      [id]
    );

    // Fetch vendor reviews
    const [reviews] = await query(
      `SELECT r.*, u.full_name AS customer_name, u.avatar_url AS customer_avatar,
              wp.title AS wedding_title
       FROM reviews r
       JOIN customers c ON r.customer_id = c.id
       JOIN users u ON c.user_id = u.id
       LEFT JOIN wedding_projects wp ON r.wedding_project_id = wp.id
       WHERE r.vendor_id = ?
       ORDER BY r.created_at DESC LIMIT 10`,
      [id]
    );

    vendor.services = services;
    vendor.reviews = reviews;

    return res.json({ success: true, data: vendor });
  } catch (error) {
    console.error('[getVendorById Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve vendor details.' });
  }
}

// Check vendor availability for a specific date and time slot
// Returns: AVAILABLE, UNAVAILABLE, ALREADY BOOKED, TEMPORARILY RESERVED
async function checkAvailability(req, res) {
  try {
    const { id } = req.params;
    const { date, start_time = '09:00:00', end_time = '21:00:00' } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required to check availability.' });
    }

    // Check availability table
    const [availRows] = await query(
      `SELECT status, reason FROM vendor_availability
       WHERE vendor_id = ? AND date = ?`,
      [id, date]
    );

    if (availRows.length > 0) {
      const entry = availRows[0];
      if (entry.status === 'UNAVAILABLE') {
        return res.json({
          success: true,
          status: 'UNAVAILABLE',
          available: false,
          message: entry.reason || 'Vendor has marked this date as unavailable.'
        });
      }
      if (entry.status === 'BOOKED') {
        return res.json({
          success: true,
          status: 'ALREADY BOOKED',
          available: false,
          message: 'Vendor is already booked for another wedding on this date.'
        });
      }
      if (entry.status === 'RESERVED') {
        return res.json({
          success: true,
          status: 'TEMPORARILY RESERVED',
          available: false,
          message: 'Vendor is temporarily reserved for an active proposal.'
        });
      }
    }

    // Check confirmed booking services
    const [bookingRows] = await query(
      `SELECT bs.id, wp.wedding_date, wp.title
       FROM booking_services bs
       JOIN bookings b ON bs.booking_id = b.id
       JOIN wedding_projects wp ON b.wedding_project_id = wp.id
       WHERE bs.vendor_id = ? AND wp.wedding_date = ?
         AND b.status IN ('CONFIRMED', 'PARTIALLY_PAID', 'FULLY_PAID', 'SERVICE_IN_PROGRESS')`,
      [id, date]
    );

    if (bookingRows.length > 0) {
      return res.json({
        success: true,
        status: 'ALREADY BOOKED',
        available: false,
        message: 'Vendor has a confirmed booking on this date.'
      });
    }

    // Check active pending vendor requests
    const [reqRows] = await query(
      `SELECT id FROM vendor_requests
       WHERE vendor_id = ? AND event_date = ? AND status = 'PENDING'`,
      [id, date]
    );

    if (reqRows.length > 0) {
      return res.json({
        success: true,
        status: 'TEMPORARILY RESERVED',
        available: false,
        message: 'A vendor request is currently pending response for this date.'
      });
    }

    return res.json({
      success: true,
      status: 'AVAILABLE',
      available: true,
      message: 'Vendor is available on this date and time.'
    });

  } catch (error) {
    console.error('[checkAvailability Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to verify availability.' });
  }
}

// Get vendor availability calendar events
async function getVendorAvailability(req, res) {
  try {
    const { id } = req.params;
    const { start_date, end_date } = req.query;

    let sql = `SELECT * FROM vendor_availability WHERE vendor_id = ?`;
    const params = [id];

    if (start_date && end_date) {
      sql += ` AND date BETWEEN ? AND ?`;
      params.push(start_date, end_date);
    }

    sql += ` ORDER BY date ASC`;

    const [rows] = await query(sql, params);
    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error('[getVendorAvailability Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve calendar.' });
  }
}

// Set / Update vendor availability (Vendor or Planner)
async function setVendorAvailability(req, res) {
  try {
    const { id } = req.params;
    const { date, start_time = '08:00:00', end_time = '22:00:00', status, reason } = req.body;

    if (!date || !status) {
      return res.status(400).json({ success: false, message: 'Date and status are required.' });
    }

    if (!['AVAILABLE', 'UNAVAILABLE', 'BOOKED', 'RESERVED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    // Upsert entry
    await query(
      `INSERT INTO vendor_availability (vendor_id, date, start_time, end_time, status, reason)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE status = VALUES(status), reason = VALUES(reason), start_time = VALUES(start_time), end_time = VALUES(end_time)`,
      [id, date, start_time, end_time, status, reason || null]
    );

    return res.json({ success: true, message: `Availability set to ${status} for ${date}.` });
  } catch (error) {
    console.error('[setVendorAvailability Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to set availability.' });
  }
}

// Vendor get own profile
async function getMyVendorProfile(req, res) {
  try {
    const userId = req.user.id;
    const [rows] = await query(
      `SELECT v.*, sc.name AS category_name, sc.slug AS category_slug,
              u.full_name AS contact_name, u.email, u.phone, u.avatar_url
       FROM vendors v
       JOIN service_categories sc ON v.category_id = sc.id
       JOIN users u ON v.user_id = u.id
       WHERE v.user_id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found.' });
    }

    const vendor = rows[0];
    const [services] = await query(`SELECT * FROM vendor_services WHERE vendor_id = ? ORDER BY id ASC`, [vendor.id]);
    vendor.services = services;

    return res.json({ success: true, data: vendor });
  } catch (error) {
    console.error('[getMyVendorProfile Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch vendor profile.' });
  }
}

// Vendor update profile
async function updateVendorProfile(req, res) {
  try {
    const { id } = req.params;
    const { business_name, description, experience_years, address, city, state, postal_code, service_locations, base_price, price_range, category_id } = req.body;

    await query(
      `UPDATE vendors SET
        business_name = COALESCE(?, business_name),
        description = COALESCE(?, description),
        experience_years = COALESCE(?, experience_years),
        address = COALESCE(?, address),
        city = COALESCE(?, city),
        state = COALESCE(?, state),
        postal_code = COALESCE(?, postal_code),
        service_locations = COALESCE(?, service_locations),
        base_price = COALESCE(?, base_price),
        price_range = COALESCE(?, price_range),
        category_id = COALESCE(?, category_id)
       WHERE id = ?`,
      [business_name, description, experience_years, address, city, state, postal_code, service_locations, base_price, price_range, category_id, id]
    );

    return res.json({ success: true, message: 'Vendor profile updated successfully.' });
  } catch (error) {
    console.error('[updateVendorProfile Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update vendor profile.' });
  }
}

// Add catalog service
async function addVendorService(req, res) {
  try {
    const { vendor_id, name, description, price, pricing_unit } = req.body;

    if (!vendor_id || !name || price === undefined) {
      return res.status(400).json({ success: false, message: 'Vendor ID, service name, and price are required.' });
    }

    const [result] = await query(
      `INSERT INTO vendor_services (vendor_id, name, description, price, pricing_unit, is_active)
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      [vendor_id, name, description || null, parseFloat(price), pricing_unit || 'per_event']
    );

    return res.status(201).json({
      success: true,
      message: 'Service added successfully.',
      service_id: result.insertId
    });
  } catch (error) {
    console.error('[addVendorService Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to add service.' });
  }
}

// Update catalog service
async function updateVendorService(req, res) {
  try {
    const { serviceId } = req.params;
    const { name, description, price, pricing_unit, is_active } = req.body;

    await query(
      `UPDATE vendor_services SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        pricing_unit = COALESCE(?, pricing_unit),
        is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [name, description, price, pricing_unit, is_active, serviceId]
    );

    return res.json({ success: true, message: 'Service updated successfully.' });
  } catch (error) {
    console.error('[updateVendorService Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update service.' });
  }
}

// Delete catalog service
async function deleteVendorService(req, res) {
  try {
    const { serviceId } = req.params;
    await query('DELETE FROM vendor_services WHERE id = ?', [serviceId]);
    return res.json({ success: true, message: 'Service deleted successfully.' });
  } catch (error) {
    console.error('[deleteVendorService Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete service.' });
  }
}

// Get all catalog services across vendors (for Planner Service Management)
async function getAllVendorServices(req, res) {
  try {
    const { category_id, category_slug, vendor_id, pricing_unit, search, sort_by } = req.query;
    const { page, limit, offset, isExplicit } = parsePagination(req.query, 12, 100);

    let baseFromWhere = `
      FROM vendor_services vs
      JOIN vendors v ON vs.vendor_id = v.id
      JOIN service_categories sc ON v.category_id = sc.id
      JOIN users u ON v.user_id = u.id
      WHERE u.is_active = TRUE
    `;
    const params = [];

    if (category_id) {
      baseFromWhere += ` AND v.category_id = ?`;
      params.push(category_id);
    }

    if (category_slug) {
      baseFromWhere += ` AND sc.slug = ?`;
      params.push(category_slug);
    }

    if (vendor_id) {
      baseFromWhere += ` AND vs.vendor_id = ?`;
      params.push(vendor_id);
    }

    if (pricing_unit) {
      baseFromWhere += ` AND vs.pricing_unit = ?`;
      params.push(pricing_unit);
    }

    if (search) {
      baseFromWhere += ` AND (vs.name LIKE ? OR vs.description LIKE ? OR v.business_name LIKE ? OR sc.name LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    const [countRows] = await query(`SELECT COUNT(*) AS total ${baseFromWhere}`, params);
    const totalCount = countRows[0]?.total || 0;

    const sortMap = {
      price_asc: 'vs.price ASC',
      price_desc: 'vs.price DESC',
      name_asc: 'vs.name ASC',
      name_desc: 'vs.name DESC',
      vendor_asc: 'v.business_name ASC',
      newest: 'vs.id DESC'
    };
    const orderClause = buildOrderBy(sort_by, sortMap, 'vs.price ASC');

    let selectSql = `
      SELECT vs.*, 
             v.business_name AS vendor_name, v.city AS vendor_city, v.rating AS vendor_rating,
             v.experience_years AS vendor_experience,
             sc.id AS category_id, sc.name AS category_name, sc.slug AS category_slug, sc.icon AS category_icon,
             u.full_name AS vendor_contact, u.email AS vendor_email, u.phone AS vendor_phone
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
    console.error('[getAllVendorServices Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve vendor services.' });
  }
}

// Vendor connected customers (Section 14: only legitimately connected customers)
async function getVendorConnectedCustomers(req, res) {
  try {
    const vendorId = req.user.vendor_id;
    if (!vendorId) return res.status(403).json({ success: false, message: 'Vendor profile not found.' });

    const { search, booking_status, wedding_date, service, sort_by } = req.query;
    const { page, limit, offset, isExplicit } = parsePagination(req.query, 10, 50);

    let baseFromWhere = `
      FROM (
        SELECT DISTINCT c.id AS customer_id, c.partner_name, c.wedding_date AS cust_wedding_date, c.city,
                        cu.full_name AS customer_name, cu.email AS customer_email, cu.phone AS customer_phone,
                        wp.id AS project_id, wp.title AS project_title, wp.project_code, wp.wedding_date,
                        pu.full_name AS planner_name,
                        bs.service_name, bs.agreed_price, bs.paid_amount, bs.status AS service_status,
                        b.status AS booking_status
        FROM booking_services bs
        JOIN bookings b ON bs.booking_id = b.id
        JOIN wedding_projects wp ON b.wedding_project_id = wp.id
        JOIN customers c ON b.customer_id = c.id
        JOIN users cu ON c.user_id = cu.id
        JOIN planners p ON b.planner_id = p.id
        JOIN users pu ON p.user_id = pu.id
        WHERE bs.vendor_id = ?

        UNION

        SELECT DISTINCT c.id AS customer_id, c.partner_name, c.wedding_date AS cust_wedding_date, c.city,
                        cu.full_name AS customer_name, cu.email AS customer_email, cu.phone AS customer_phone,
                        wp.id AS project_id, wp.title AS project_title, wp.project_code, wp.wedding_date,
                        pu.full_name AS planner_name,
                        COALESCE(vs.name, 'Wedding Package') AS service_name, vr.proposed_price AS agreed_price, 0 AS paid_amount,
                        'PROPOSED' AS service_status,
                        'REQUESTED' AS booking_status
        FROM vendor_requests vr
        JOIN wedding_projects wp ON vr.wedding_project_id = wp.id
        JOIN customers c ON wp.customer_id = c.id
        JOIN users cu ON c.user_id = cu.id
        JOIN planners p ON vr.planner_id = p.id
        JOIN users pu ON p.user_id = pu.id
        LEFT JOIN vendor_services vs ON vr.service_id = vs.id
        WHERE vr.vendor_id = ? AND vr.status IN ('ACCEPTED', 'PENDING')
      ) client_view
      WHERE 1=1
    `;
    const params = [vendorId, vendorId];

    if (search) {
      baseFromWhere += ` AND (customer_name LIKE ? OR project_title LIKE ? OR project_code LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (booking_status) {
      baseFromWhere += ` AND booking_status = ?`;
      params.push(booking_status);
    }

    if (wedding_date) {
      baseFromWhere += ` AND wedding_date = ?`;
      params.push(wedding_date);
    }

    if (service) {
      baseFromWhere += ` AND service_name LIKE ?`;
      params.push(`%${service}%`);
    }

    const [countRows] = await query(`SELECT COUNT(*) AS total ${baseFromWhere}`, params);
    const totalCount = countRows[0]?.total || 0;

    const sortMap = {
      name_asc: 'customer_name ASC',
      name_desc: 'customer_name DESC',
      date_asc: 'wedding_date ASC',
      date_desc: 'wedding_date DESC',
      status_asc: 'booking_status ASC',
      status_desc: 'booking_status DESC'
    };
    const orderClause = buildOrderBy(sort_by, sortMap, 'wedding_date ASC');

    let selectSql = `
      SELECT * ${baseFromWhere}
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
    console.error('[getVendorConnectedCustomers Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve connected customers.' });
  }
}

module.exports = {
  getCategories,
  getVendors,
  getVendorById,
  checkAvailability,
  getVendorAvailability,
  setVendorAvailability,
  getMyVendorProfile,
  updateVendorProfile,
  addVendorService,
  updateVendorService,
  deleteVendorService,
  getAllVendorServices,
  getVendorConnectedCustomers
};
