const { verifyTokenWithDetails } = require('../config/jwt');
const { query } = require('../config/db');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        code: 'NO_TOKEN',
        message: 'Authentication required. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    const { valid, decoded, expired } = verifyTokenWithDetails(token);

    if (!valid || !decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        code: expired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID',
        message: expired ? 'Session has expired. Please log in again.' : 'Invalid token. Please log in again.'
      });
    }

    // Query user and attached role
    const [rows] = await query(
      `SELECT u.id, u.email, u.full_name, u.phone, u.avatar_url, u.auth_provider, u.is_active,
              r.name AS role_name, r.id AS role_id
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ? AND u.is_active = TRUE`,
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User account not found or deactivated.'
      });
    }

    const user = rows[0];

    // If role is VENDOR, fetch vendor_id
    if (user.role_name === 'VENDOR') {
      const [vendorRows] = await query(`SELECT id, business_name, category_id FROM vendors WHERE user_id = ?`, [user.id]);
      if (vendorRows.length > 0) {
        user.vendor_id = vendorRows[0].id;
        user.business_name = vendorRows[0].business_name;
        user.category_id = vendorRows[0].category_id;
      }
    }

    // If role is CUSTOMER, fetch customer_id
    if (user.role_name === 'CUSTOMER') {
      const [customerRows] = await query(`SELECT id, partner_name, wedding_date, planner_id FROM customers WHERE user_id = ?`, [user.id]);
      if (customerRows.length > 0) {
        user.customer_id = customerRows[0].id;
        user.partner_name = customerRows[0].partner_name;
        user.wedding_date = customerRows[0].wedding_date;
        user.planner_id = customerRows[0].planner_id;
      }
    }

    // If role is PLANNER, fetch planner_id
    if (user.role_name === 'PLANNER') {
      const [plannerRows] = await query(`SELECT id, agency_name FROM planners WHERE user_id = ?`, [user.id]);
      if (plannerRows.length > 0) {
        user.planner_id = plannerRows[0].id;
        user.agency_name = plannerRows[0].agency_name;
      }
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[AuthMiddleware Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication processing failed.'
    });
  }
}

module.exports = authMiddleware;
