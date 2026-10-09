const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const { createNotification } = require('../services/notificationService');
const { parsePagination, buildPaginationResponse, buildOrderBy } = require('../utils/queryHelper');

// Get all customers (Planner only)
async function getAllCustomers(req, res) {
  try {
    const { search, city, planner_id, status, sort_by } = req.query;
    const { page, limit, offset, isExplicit } = parsePagination(req.query, 10, 100);

    let baseFromWhere = `
      FROM customers c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN planners p ON c.planner_id = p.id
      LEFT JOIN users pu ON p.user_id = pu.id
      LEFT JOIN wedding_projects wp ON wp.customer_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      baseFromWhere += ` AND (u.full_name LIKE ? OR c.partner_name LIKE ? OR u.email LIKE ? OR c.city LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (city) {
      baseFromWhere += ` AND c.city = ?`;
      params.push(city);
    }

    if (planner_id) {
      baseFromWhere += ` AND c.planner_id = ?`;
      params.push(planner_id);
    }

    if (status) {
      baseFromWhere += ` AND wp.status = ?`;
      params.push(status);
    }

    // 1. Get total count
    const [countRows] = await query(`SELECT COUNT(*) AS total ${baseFromWhere}`, params);
    const totalCount = countRows[0]?.total || 0;

    // 2. Sorting
    const sortMap = {
      name_asc: 'u.full_name ASC',
      name_desc: 'u.full_name DESC',
      budget_desc: 'c.estimated_budget DESC',
      budget_asc: 'c.estimated_budget ASC',
      date_asc: 'c.wedding_date ASC',
      date_desc: 'c.wedding_date DESC',
      newest: 'c.created_at DESC'
    };
    const orderClause = buildOrderBy(sort_by, sortMap, 'c.created_at DESC');

    // 3. Selection query
    let selectSql = `
      SELECT c.id AS customer_id, c.partner_name, c.wedding_date, c.city, c.state, c.address,
             c.wedding_theme, c.guest_count, c.estimated_budget, c.planner_id,
             u.id AS user_id, u.email, u.full_name, u.phone, u.avatar_url, u.created_at,
             p.agency_name AS assigned_planner_name,
             pu.full_name AS planner_contact_name,
             wp.id AS wedding_project_id, wp.title AS project_title, wp.status AS project_status
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
    console.error('[getAllCustomers Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve customers.' });
  }
}

// Get customer by ID
async function getCustomerById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await query(
      `SELECT c.*, u.full_name, u.email, u.phone, u.avatar_url,
              p.agency_name AS assigned_planner_name,
              pu.full_name AS planner_contact_name, pu.email AS planner_email, pu.phone AS planner_phone
       FROM customers c
       JOIN users u ON c.user_id = u.id
       LEFT JOIN planners p ON c.planner_id = p.id
       LEFT JOIN users pu ON p.user_id = pu.id
       WHERE c.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    // Also get customer requirements, project, and bookings
    const customer = rows[0];
    const [reqs] = await query(`SELECT * FROM wedding_requirements WHERE customer_id = ? ORDER BY created_at DESC`, [id]);
    const [projects] = await query(`SELECT * FROM wedding_projects WHERE customer_id = ?`, [id]);
    const [bookings] = await query(`SELECT * FROM bookings WHERE customer_id = ?`, [id]);

    customer.requirements = reqs;
    customer.projects = projects;
    customer.bookings = bookings;

    return res.json({ success: true, data: customer });
  } catch (error) {
    console.error('[getCustomerById Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve customer details.' });
  }
}

// Add new customer (Planner only)
async function createCustomer(req, res) {
  try {
    const { full_name, email, phone, password, partner_name, wedding_date, city, estimated_budget, guest_count, wedding_theme } = req.body;

    if (!full_name || !email) {
      return res.status(400).json({ success: false, message: 'Full name and email are required.' });
    }

    // Check email uniqueness
    const [existing] = await query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'User with this email already exists.' });
    }

    const [roleRows] = await query('SELECT id FROM roles WHERE name = "CUSTOMER"');
    const roleId = roleRows[0].id;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password || 'password123', salt);

    const [userResult] = await query(
      `INSERT INTO users (email, password_hash, role_id, full_name, phone, auth_provider, email_verified, is_active)
       VALUES (?, ?, ?, ?, ?, 'local', TRUE, TRUE)`,
      [email.toLowerCase().trim(), passwordHash, roleId, full_name.trim(), phone || null]
    );

    const userId = userResult.insertId;

    const [custResult] = await query(
      `INSERT INTO customers (user_id, partner_name, wedding_date, city, estimated_budget, guest_count, wedding_theme, planner_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, partner_name || null, wedding_date || null, city || 'Bangalore', estimated_budget || 1000000.00, guest_count || 300, wedding_theme || 'Traditional', req.user.planner_id || 1]
    );

    return res.status(201).json({
      success: true,
      message: 'Customer created and assigned successfully.',
      customer_id: custResult.insertId,
      user_id: userId
    });
  } catch (error) {
    console.error('[createCustomer Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to create customer.' });
  }
}

// Update customer details
async function updateCustomer(req, res) {
  try {
    const { id } = req.params;
    const { full_name, phone, partner_name, wedding_date, city, state, address, estimated_budget, guest_count, wedding_theme, planner_id } = req.body;

    // Get customer's user_id
    const [cRows] = await query('SELECT user_id FROM customers WHERE id = ?', [id]);
    if (cRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const userId = cRows[0].user_id;

    // Update users table
    if (full_name || phone) {
      await query(`UPDATE users SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone) WHERE id = ?`, [full_name, phone, userId]);
    }

    // Update customers table
    await query(
      `UPDATE customers SET
        partner_name = COALESCE(?, partner_name),
        wedding_date = COALESCE(?, wedding_date),
        city = COALESCE(?, city),
        state = COALESCE(?, state),
        address = COALESCE(?, address),
        estimated_budget = COALESCE(?, estimated_budget),
        guest_count = COALESCE(?, guest_count),
        wedding_theme = COALESCE(?, wedding_theme),
        planner_id = COALESCE(?, planner_id)
       WHERE id = ?`,
      [partner_name, wedding_date, city, state, address, estimated_budget, guest_count, wedding_theme, planner_id, id]
    );

    return res.json({ success: true, message: 'Customer updated successfully.' });
  } catch (error) {
    console.error('[updateCustomer Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update customer.' });
  }
}

// Delete customer
async function deleteCustomer(req, res) {
  try {
    const { id } = req.params;
    const [cRows] = await query('SELECT user_id FROM customers WHERE id = ?', [id]);
    if (cRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const userId = cRows[0].user_id;
    // Deleting user cascades to customers
    await query('DELETE FROM users WHERE id = ?', [userId]);

    return res.json({ success: true, message: 'Customer deleted successfully.' });
  } catch (error) {
    console.error('[deleteCustomer Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete customer. Ensure no active financial records conflict.' });
  }
}

// Assign planner to customer
async function assignPlanner(req, res) {
  try {
    const { id } = req.params;
    const { planner_id } = req.body;

    if (!planner_id) {
      return res.status(400).json({ success: false, message: 'planner_id is required.' });
    }

    await query('UPDATE customers SET planner_id = ? WHERE id = ?', [planner_id, id]);
    return res.json({ success: true, message: 'Planner assigned successfully.' });
  } catch (error) {
    console.error('[assignPlanner Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to assign planner.' });
  }
}

// Customer get own profile
async function getMyCustomerProfile(req, res) {
  try {
    const userId = req.user.id;
    const [rows] = await query(
      `SELECT c.*, u.full_name, u.email, u.phone, u.avatar_url,
              p.agency_name AS assigned_planner_name, p.bio AS planner_bio, p.experience_years AS planner_experience,
              pu.full_name AS planner_contact_name, pu.email AS planner_email, pu.phone AS planner_phone, pu.avatar_url AS planner_avatar
       FROM customers c
       JOIN users u ON c.user_id = u.id
       LEFT JOIN planners p ON c.planner_id = p.id
       LEFT JOIN users pu ON p.user_id = pu.id
       WHERE c.user_id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer profile not found.' });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('[getMyCustomerProfile Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch customer profile.' });
  }
}

// Get all certified available wedding planners
async function getAvailablePlanners(req, res) {
  try {
    const [rows] = await query(
      `SELECT p.id, p.agency_name, p.bio, p.experience_years,
              u.id AS user_id, u.full_name, u.email, u.phone, u.avatar_url,
              (SELECT COUNT(*) FROM wedding_projects WHERE planner_id = p.id AND status = 'COMPLETED') AS completed_weddings,
              4.9 AS rating
       FROM planners p
       JOIN users u ON p.user_id = u.id
       WHERE u.is_active = TRUE`
    );

    return res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('[getAvailablePlanners Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve planners.' });
  }
}

// Customer sends an engagement / consultation request to a planner
async function requestPlanner(req, res) {
  try {
    const { planner_id, wedding_vision, preferred_date } = req.body;

    if (!planner_id) {
      return res.status(400).json({ success: false, message: 'Please select a wedding planner.' });
    }

    const [cRows] = await query('SELECT id, user_id FROM customers WHERE user_id = ?', [req.user.id]);
    if (cRows.length === 0) return res.status(403).json({ success: false, message: 'Customer record not found.' });

    const customer = cRows[0];

    // Assign planner to customer
    await query('UPDATE customers SET planner_id = ? WHERE id = ?', [planner_id, customer.id]);

    // Fetch planner user_id
    const [pRows] = await query('SELECT user_id, agency_name FROM planners WHERE id = ?', [planner_id]);
    if (pRows.length > 0) {
      await createNotification({
        userId: pRows[0].user_id,
        title: 'New Customer Wedding Planner Engagement Request',
        message: `${req.user.full_name} has requested you as their lead wedding planner for their upcoming ceremony.${wedding_vision ? ` Vision: "${wedding_vision}"` : ''}`,
        notificationType: 'SYSTEM',
        referenceId: customer.id,
        referenceType: 'customer'
      });
    }

    return res.json({
      success: true,
      message: 'Engagement request dispatched! Your wedding planner will review your profile and connect with you.'
    });

  } catch (error) {
    console.error('[requestPlanner Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit planner request.' });
  }
}

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  assignPlanner,
  getMyCustomerProfile,
  getAvailablePlanners,
  requestPlanner
};
