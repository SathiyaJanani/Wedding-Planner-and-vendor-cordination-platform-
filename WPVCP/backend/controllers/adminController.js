const { query } = require('../config/db');

// 1. Get platform-wide executive metrics & KPIs
async function getAdminMetrics(req, res) {
  try {
    // Total users breakdown
    const [userCounts] = await query(`
      SELECT r.name AS role_name, COUNT(u.id) AS count
      FROM roles r
      LEFT JOIN users u ON u.role_id = r.id
      GROUP BY r.name
    `);

    // Total projects & status
    const [projectStats] = await query(`
      SELECT 
        COUNT(*) AS total_projects,
        SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) AS in_progress,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN status = 'PLANNING' THEN 1 ELSE 0 END) AS planning,
        COALESCE(SUM(total_budget), 0) AS total_budget_volume
      FROM wedding_projects
    `);

    // Financial escrow & payment statistics
    const [financialStats] = await query(`
      SELECT 
        COALESCE(SUM(total_amount), 0) AS total_contracted,
        COALESCE(SUM(paid_amount), 0) AS total_escrow_collected,
        COUNT(*) AS total_bookings
      FROM bookings
    `);

    // Vendor stats
    const [vendorStats] = await query(`
      SELECT 
        COUNT(*) AS total_vendors,
        SUM(CASE WHEN is_verified = TRUE THEN 1 ELSE 0 END) AS verified_vendors,
        COALESCE(AVG(rating), 0) AS avg_vendor_rating
      FROM vendors
    `);

    // Invoices and GST
    const [invoiceStats] = await query(`
      SELECT 
        COUNT(*) AS total_invoices,
        COALESCE(SUM(total_amount), 0) AS invoiced_volume,
        COALESCE(SUM(tax_amount), 0) AS total_gst_collected
      FROM invoices
    `);

    // Support tickets
    const [supportStats] = await query(`
      SELECT 
        COUNT(*) AS total_tickets,
        SUM(CASE WHEN status = 'OPEN' THEN 1 ELSE 0 END) AS open_tickets,
        SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) AS in_progress_tickets,
        SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) AS resolved_tickets
      FROM support_requests
    `);

    // Calculate platform estimated commission (5% coordination fee)
    const escrowCollected = parseFloat(financialStats[0].total_escrow_collected) || 0;
    const platformFee = escrowCollected * 0.05;

    return res.json({
      success: true,
      data: {
        users: userCounts.reduce((acc, curr) => ({ ...acc, [curr.role_name]: curr.count }), {}),
        projects: projectStats[0],
        finances: {
          total_contracted: parseFloat(financialStats[0].total_contracted) || 0,
          total_escrow_collected: escrowCollected,
          pending_clearance: (parseFloat(financialStats[0].total_contracted) || 0) - escrowCollected,
          platform_commission_earned: platformFee,
          total_bookings: financialStats[0].total_bookings,
          invoiced_volume: parseFloat(invoiceStats[0].invoiced_volume) || 0,
          total_gst_collected: parseFloat(invoiceStats[0].total_gst_collected) || 0
        },
        vendors: vendorStats[0],
        support: supportStats[0],
        server: {
          uptime: process.uptime(),
          node_version: process.version,
          platform: process.platform,
          mysql_status: 'CONNECTED',
          database_name: process.env.DB_NAME || 'wedding_planner'
        }
      }
    });
  } catch (error) {
    console.error('[getAdminMetrics Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to aggregate administrative metrics.' });
  }
}

// 2. Get all system users with filters
async function getAdminUsers(req, res) {
  try {
    const { role, search, status } = req.query;

    let sql = `
      SELECT u.id, u.email, u.full_name, u.phone, u.avatar_url, u.auth_provider, u.is_active, u.created_at,
             r.name AS role_name,
             CASE 
               WHEN r.name = 'CUSTOMER' THEN (SELECT partner_name FROM customers WHERE user_id = u.id LIMIT 1)
               WHEN r.name = 'VENDOR' THEN (SELECT business_name FROM vendors WHERE user_id = u.id LIMIT 1)
               WHEN r.name = 'PLANNER' THEN (SELECT agency_name FROM planners WHERE user_id = u.id LIMIT 1)
               ELSE 'Platform Administrator'
             END AS entity_title
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE 1=1
    `;
    const params = [];

    if (role && role !== 'ALL') {
      sql += ' AND r.name = ?';
      params.push(role.toUpperCase());
    }

    if (status && status !== 'ALL') {
      sql += ' AND u.is_active = ?';
      params.push(status === 'active');
    }

    if (search && search.trim() !== '') {
      sql += ' AND (u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY u.created_at DESC';

    const [users] = await query(sql, params);

    return res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    console.error('[getAdminUsers Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve system users.' });
  }
}

// 3. Toggle user active status
async function toggleUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    // Prevent deactivating own account
    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own administrative account.' });
    }

    await query('UPDATE users SET is_active = ? WHERE id = ?', [is_active === true, id]);

    return res.json({
      success: true,
      message: `User account has been ${is_active ? 'activated' : 'deactivated'} successfully.`
    });
  } catch (error) {
    console.error('[toggleUserStatus Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user status.' });
  }
}

// 4. Get recent system activity logs / audit trail
async function getAdminAuditLogs(req, res) {
  try {
    // Compile real system events: recent notifications, recent payments, recent booking status changes
    const [notifications] = await query(`
      SELECT n.id, n.title, n.message, n.notification_type, n.created_at,
             u.full_name AS user_name, u.email AS user_email, r.name AS role_name
      FROM notifications n
      JOIN users u ON n.user_id = u.id
      JOIN roles r ON u.role_id = r.id
      ORDER BY n.created_at DESC
      LIMIT 25
    `);

    const [recentPayments] = await query(`
      SELECT p.id, p.transaction_reference, p.amount, p.milestone_name, p.status, p.payment_method, p.payment_date,
             wp.title AS project_title,
             cu.full_name AS customer_name
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN wedding_projects wp ON b.wedding_project_id = wp.id
      JOIN customers c ON wp.customer_id = c.id
      JOIN users cu ON c.user_id = cu.id
      ORDER BY p.payment_date DESC
      LIMIT 15
    `);

    return res.json({
      success: true,
      data: {
        recent_notifications: notifications,
        recent_payments: recentPayments
      }
    });
  } catch (error) {
    console.error('[getAdminAuditLogs Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve audit trail logs.' });
  }
}

module.exports = {
  getAdminMetrics,
  getAdminUsers,
  toggleUserStatus,
  getAdminAuditLogs
};
