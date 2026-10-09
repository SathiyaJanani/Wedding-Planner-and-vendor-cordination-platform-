const { query } = require('../config/db');

// Main reports endpoint - branches by role
async function getReports(req, res) {
  try {
    const user = req.user;

    // -----------------------------------------------------------------------
    // PLANNER REPORTS (Supports Weekly, Monthly, Yearly, Custom date ranges)
    // -----------------------------------------------------------------------
    if (user.role_name === 'PLANNER') {
      const { period = 'monthly' } = req.query;
      let { startDate, endDate } = req.query;

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      if (period === 'weekly') {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        startDate = d.toISOString().split('T')[0];
        endDate = todayStr;
      } else if (period === 'monthly') {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        startDate = d.toISOString().split('T')[0];
        endDate = todayStr;
      } else if (period === 'yearly') {
        startDate = `${now.getFullYear()}-01-01`;
        endDate = todayStr;
      } else if (period === 'custom') {
        if (!startDate) {
          const d = new Date();
          d.setDate(d.getDate() - 30);
          startDate = d.toISOString().split('T')[0];
        }
        if (!endDate) {
          endDate = todayStr;
        }
      } else {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        startDate = d.toISOString().split('T')[0];
        endDate = todayStr;
      }

      // 1. Overall Lifetime KPIs
      const [lifetimeKpis] = await query(`
        SELECT 
          (SELECT COUNT(*) FROM customers) AS total_customers,
          (SELECT COUNT(*) FROM wedding_projects WHERE status IN ('PLANNING', 'IN_PROGRESS', 'CONFIRMED')) AS active_weddings,
          (SELECT COUNT(*) FROM wedding_projects WHERE status = 'COMPLETED') AS completed_weddings,
          (SELECT COUNT(*) FROM vendors) AS total_vendors,
          (SELECT COUNT(*) FROM vendor_requests WHERE status = 'PENDING') AS pending_requests,
          (SELECT COUNT(*) FROM vendor_requests WHERE status = 'ACCEPTED') AS accepted_requests,
          (SELECT COUNT(*) FROM vendor_requests WHERE status = 'DECLINED') AS declined_requests,
          (SELECT COUNT(*) FROM bookings WHERE status = 'CONFIRMED') AS confirmed_bookings,
          (SELECT COALESCE(SUM(total_amount), 0) FROM bookings) AS total_contract_value,
          (SELECT COALESCE(SUM(paid_amount), 0) FROM bookings) AS total_revenue_collected,
          (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'PENDING') AS pending_payments_amount
      `);

      // 2. Filtered Period KPIs
      const [periodKpis] = await query(`
        SELECT
          (SELECT COUNT(*) FROM customers WHERE created_at BETWEEN ? AND CONCAT(?, ' 23:59:59')) AS period_customers,
          (SELECT COUNT(*) FROM wedding_projects WHERE created_at BETWEEN ? AND CONCAT(?, ' 23:59:59')) AS period_projects,
          (SELECT COUNT(*) FROM wedding_projects WHERE status = 'COMPLETED' AND updated_at BETWEEN ? AND CONCAT(?, ' 23:59:59')) AS period_completed_weddings,
          (SELECT COUNT(*) FROM bookings WHERE created_at BETWEEN ? AND CONCAT(?, ' 23:59:59')) AS period_bookings,
          (SELECT COALESCE(SUM(total_amount), 0) FROM bookings WHERE created_at BETWEEN ? AND CONCAT(?, ' 23:59:59')) AS period_contract_value,
          (SELECT COALESCE(SUM(paid_amount), 0) FROM bookings WHERE created_at BETWEEN ? AND CONCAT(?, ' 23:59:59')) AS period_revenue_collected,
          (SELECT COUNT(*) FROM vendor_requests WHERE created_at BETWEEN ? AND CONCAT(?, ' 23:59:59')) AS period_vendor_requests,
          (SELECT COUNT(*) FROM vendor_requests WHERE status = 'ACCEPTED' AND created_at BETWEEN ? AND CONCAT(?, ' 23:59:59')) AS period_accepted_requests,
          (SELECT COUNT(*) FROM vendor_requests WHERE status = 'DECLINED' AND created_at BETWEEN ? AND CONCAT(?, ' 23:59:59')) AS period_declined_requests,
          (SELECT COUNT(*) FROM vendor_requests WHERE status = 'PENDING' AND created_at BETWEEN ? AND CONCAT(?, ' 23:59:59')) AS period_pending_requests
      `, [
        startDate, endDate,
        startDate, endDate,
        startDate, endDate,
        startDate, endDate,
        startDate, endDate,
        startDate, endDate,
        startDate, endDate,
        startDate, endDate,
        startDate, endDate,
        startDate, endDate
      ]);

      // 3. Periodic Trend breakdown for Charts
      let trendSql = '';
      if (period === 'weekly') {
        // Daily breakdown for week
        trendSql = `
          SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS date_key,
                 DATE_FORMAT(created_at, '%a (%d %b)') AS label,
                 COUNT(*) AS total_bookings,
                 COALESCE(SUM(total_amount), 0) AS booking_value,
                 COALESCE(SUM(paid_amount), 0) AS revenue_collected
          FROM bookings
          WHERE created_at BETWEEN ? AND CONCAT(?, ' 23:59:59')
          GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d'), DATE_FORMAT(created_at, '%a (%d %b)')
          ORDER BY date_key ASC
        `;
      } else if (period === 'yearly') {
        // Monthly breakdown for year
        trendSql = `
          SELECT DATE_FORMAT(created_at, '%Y-%m') AS date_key,
                 DATE_FORMAT(created_at, '%b %Y') AS label,
                 COUNT(*) AS total_bookings,
                 COALESCE(SUM(total_amount), 0) AS booking_value,
                 COALESCE(SUM(paid_amount), 0) AS revenue_collected
          FROM bookings
          WHERE created_at BETWEEN ? AND CONCAT(?, ' 23:59:59')
          GROUP BY DATE_FORMAT(created_at, '%Y-%m'), DATE_FORMAT(created_at, '%b %Y')
          ORDER BY date_key ASC
        `;
      } else {
        // Default / Monthly / Custom: daily or multi-day breakdown
        trendSql = `
          SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS date_key,
                 DATE_FORMAT(created_at, '%d %b') AS label,
                 COUNT(*) AS total_bookings,
                 COALESCE(SUM(total_amount), 0) AS booking_value,
                 COALESCE(SUM(paid_amount), 0) AS revenue_collected
          FROM bookings
          WHERE created_at BETWEEN ? AND CONCAT(?, ' 23:59:59')
          GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d'), DATE_FORMAT(created_at, '%d %b')
          ORDER BY date_key ASC LIMIT 31
        `;
      }

      const [trends] = await query(trendSql, [startDate, endDate]);

      // 4. Category distribution for this period
      const [categoriesCount] = await query(`
        SELECT sc.name, 
               COUNT(DISTINCT v.id) AS vendor_count,
               COUNT(vr.id) AS request_count,
               COALESCE(SUM(CASE WHEN vr.status = 'ACCEPTED' THEN vr.proposed_price ELSE 0 END), 0) AS accepted_amount
        FROM service_categories sc
        LEFT JOIN vendors v ON sc.id = v.category_id
        LEFT JOIN vendor_requests vr ON v.id = vr.vendor_id AND vr.created_at BETWEEN ? AND CONCAT(?, ' 23:59:59')
        GROUP BY sc.id, sc.name
        ORDER BY request_count DESC, vendor_count DESC LIMIT 10
      `, [startDate, endDate]);

      // 5. Bookings during this period
      const [periodBookings] = await query(`
        SELECT b.id, b.booking_code, b.total_amount, b.advance_amount, b.paid_amount, b.status, b.created_at,
               wp.title AS project_title, wp.project_code, wp.wedding_date,
               u.full_name AS customer_name
        FROM bookings b
        JOIN wedding_projects wp ON b.wedding_project_id = wp.id
        JOIN customers c ON b.customer_id = c.id
        JOIN users u ON c.user_id = u.id
        WHERE b.created_at BETWEEN ? AND CONCAT(?, ' 23:59:59')
        ORDER BY b.created_at DESC LIMIT 30
      `, [startDate, endDate]);

      // 6. Vendor Requests dispatched in this period
      const [periodRequests] = await query(`
        SELECT vr.id, vr.request_code, vr.event_date, vr.proposed_price, vr.status, vr.decline_reason, vr.created_at,
               wp.title AS project_title, v.business_name, sc.name AS category_name
        FROM vendor_requests vr
        JOIN wedding_projects wp ON vr.wedding_project_id = wp.id
        JOIN vendors v ON vr.vendor_id = v.id
        JOIN service_categories sc ON v.category_id = sc.id
        WHERE vr.created_at BETWEEN ? AND CONCAT(?, ' 23:59:59')
        ORDER BY vr.created_at DESC LIMIT 30
      `, [startDate, endDate]);

      // 7. Upcoming weddings list
      const [upcoming] = await query(`
        SELECT wp.id, wp.project_code, wp.title, wp.wedding_date, wp.city, wp.total_budget, wp.status,
               cu.full_name AS customer_name
        FROM wedding_projects wp
        JOIN customers c ON wp.customer_id = c.id
        JOIN users cu ON c.user_id = cu.id
        WHERE wp.wedding_date >= CURRENT_DATE
        ORDER BY wp.wedding_date ASC LIMIT 5
      `);

      return res.json({
        success: true,
        role: 'PLANNER',
        period,
        startDate,
        endDate,
        period_kpis: periodKpis[0],
        lifetime_kpis: lifetimeKpis[0],
        kpis: lifetimeKpis[0], // backward compatibility
        monthly_trends: trends,
        category_distribution: categoriesCount,
        period_bookings: periodBookings,
        period_requests: periodRequests,
        upcoming_weddings: upcoming
      });

    // -----------------------------------------------------------------------
    // VENDOR REPORTS (Supports Weekly, Monthly, Yearly, Custom date ranges)
    // -----------------------------------------------------------------------
    } else if (user.role_name === 'VENDOR') {
      const vendorId = user.vendor_id;
      if (!vendorId) return res.status(403).json({ success: false, message: 'Vendor profile not found.' });

      const { period = 'monthly' } = req.query;
      let { startDate, endDate } = req.query;

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      if (period === 'weekly') {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        startDate = d.toISOString().split('T')[0];
        endDate = todayStr;
      } else if (period === 'monthly') {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        startDate = d.toISOString().split('T')[0];
        endDate = todayStr;
      } else if (period === 'yearly') {
        startDate = `${now.getFullYear()}-01-01`;
        endDate = todayStr;
      } else if (period === 'custom') {
        if (!startDate) {
          const d = new Date();
          d.setDate(d.getDate() - 30);
          startDate = d.toISOString().split('T')[0];
        }
        if (!endDate) {
          endDate = todayStr;
        }
      } else {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        startDate = d.toISOString().split('T')[0];
        endDate = todayStr;
      }

      const startDateTime = `${startDate} 00:00:00`;
      const endDateTime = `${endDate} 23:59:59`;

      // 1. Lifetime KPIs for vendor
      const [lifetimeKpis] = await query(`
        SELECT
          (SELECT COUNT(*) FROM vendor_requests WHERE vendor_id = ?) AS all_time_requests,
          (SELECT COUNT(*) FROM vendor_requests WHERE vendor_id = ? AND status = 'ACCEPTED') AS all_time_accepted,
          (SELECT COUNT(*) FROM booking_services WHERE vendor_id = ? AND status IN ('CONFIRMED', 'CUSTOMER_APPROVED')) AS all_time_engagements,
          (SELECT COALESCE(SUM(agreed_price), 0) FROM booking_services WHERE vendor_id = ?) AS all_time_earnings,
          (SELECT rating FROM vendors WHERE id = ?) AS current_rating,
          (SELECT total_reviews FROM vendors WHERE id = ?) AS total_reviews_count
      `, [vendorId, vendorId, vendorId, vendorId, vendorId, vendorId]);

      // 2. Period KPIs for vendor
      const [periodRequestStats] = await query(`
        SELECT
          COUNT(*) AS period_total_requests,
          SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS period_pending_requests,
          SUM(CASE WHEN status = 'ACCEPTED' THEN 1 ELSE 0 END) AS period_accepted_requests,
          SUM(CASE WHEN status = 'DECLINED' THEN 1 ELSE 0 END) AS period_declined_requests,
          COALESCE(SUM(CASE WHEN status = 'ACCEPTED' THEN proposed_price ELSE 0 END), 0) AS period_accepted_value
        FROM vendor_requests
        WHERE vendor_id = ? AND created_at BETWEEN ? AND ?
      `, [vendorId, startDateTime, endDateTime]);

      const [periodEngagementStats] = await query(`
        SELECT
          COUNT(bs.id) AS period_engagements_count,
          COALESCE(SUM(bs.agreed_price), 0) AS period_contracted_earnings,
          SUM(CASE WHEN wp.wedding_date <= CURRENT_DATE THEN 1 ELSE 0 END) AS period_completed_events
        FROM booking_services bs
        JOIN bookings b ON bs.booking_id = b.id
        JOIN wedding_projects wp ON b.wedding_project_id = wp.id
        WHERE bs.vendor_id = ?
          AND (wp.wedding_date BETWEEN ? AND ? OR bs.created_at BETWEEN ? AND ?)
      `, [vendorId, startDate, endDate, startDateTime, endDateTime]);

      const reqStats = periodRequestStats[0] || {};
      const engStats = periodEngagementStats[0] || {};
      const totalReqs = Number(reqStats.period_total_requests || 0);
      const acceptedReqs = Number(reqStats.period_accepted_requests || 0);
      const acceptanceRate = totalReqs > 0 ? Math.round((acceptedReqs / totalReqs) * 100) : 0;

      const periodKpis = {
        period_total_requests: totalReqs,
        period_pending_requests: Number(reqStats.period_pending_requests || 0),
        period_accepted_requests: acceptedReqs,
        period_declined_requests: Number(reqStats.period_declined_requests || 0),
        period_accepted_value: Number(reqStats.period_accepted_value || 0),
        period_engagements_count: Number(engStats.period_engagements_count || 0),
        period_contracted_earnings: Number(engStats.period_contracted_earnings || 0),
        period_completed_events: Number(engStats.period_completed_events || 0),
        acceptance_rate: acceptanceRate
      };

      // 3. Monthly Trends (last 6 months) for visual bar charts
      const [monthlyTrends] = await query(`
        SELECT 
          DATE_FORMAT(wp.wedding_date, '%b %Y') AS month_label,
          DATE_FORMAT(wp.wedding_date, '%Y-%m') AS sort_month,
          COUNT(bs.id) AS engagement_count,
          COALESCE(SUM(bs.agreed_price), 0) AS revenue_collected
        FROM booking_services bs
        JOIN bookings b ON bs.booking_id = b.id
        JOIN wedding_projects wp ON b.wedding_project_id = wp.id
        WHERE bs.vendor_id = ? AND wp.wedding_date >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)
        GROUP BY sort_month, month_label
        ORDER BY sort_month ASC
      `, [vendorId]);

      // 4. Period Engagements / Bookings
      const [periodEngagements] = await query(`
        SELECT bs.id, bs.service_name, bs.agreed_price, bs.status,
               b.booking_code, b.status AS booking_status,
               wp.title AS project_title, wp.project_code, wp.wedding_date, wp.venue_name, wp.city,
               cu.full_name AS customer_name, cu.phone AS customer_phone, cu.email AS customer_email
        FROM booking_services bs
        JOIN bookings b ON bs.booking_id = b.id
        JOIN wedding_projects wp ON b.wedding_project_id = wp.id
        JOIN customers c ON b.customer_id = c.id
        JOIN users cu ON c.user_id = cu.id
        WHERE bs.vendor_id = ?
          AND (wp.wedding_date BETWEEN ? AND ? OR bs.created_at BETWEEN ? AND ?)
        ORDER BY wp.wedding_date DESC
      `, [vendorId, startDate, endDate, startDateTime, endDateTime]);

      // 5. Period Requests
      const [periodRequests] = await query(`
        SELECT vr.id, vr.request_code, vr.status, vr.proposed_price, vr.event_date, vr.notes, vr.decline_reason, vr.created_at,
               wp.title AS project_title, wp.project_code,
               u.full_name AS planner_name, u.phone AS planner_phone
        FROM vendor_requests vr
        JOIN wedding_projects wp ON vr.wedding_project_id = wp.id
        JOIN planners p ON vr.planner_id = p.id
        JOIN users u ON p.user_id = u.id
        WHERE vr.vendor_id = ?
          AND vr.created_at BETWEEN ? AND ?
        ORDER BY vr.created_at DESC
      `, [vendorId, startDateTime, endDateTime]);

      // 6. Period Reviews
      const [periodReviews] = await query(`
        SELECT r.*, u.full_name AS customer_name, wp.title AS project_title
        FROM reviews r
        JOIN customers c ON r.customer_id = c.id
        JOIN users u ON c.user_id = u.id
        LEFT JOIN wedding_projects wp ON r.wedding_project_id = wp.id
        WHERE r.vendor_id = ?
          AND r.created_at BETWEEN ? AND ?
        ORDER BY r.created_at DESC
      `, [vendorId, startDateTime, endDateTime]);

      // 7. Upcoming Engagements (future dates)
      const [upcomingEngagements] = await query(`
        SELECT bs.service_name, bs.agreed_price, bs.status,
               wp.title AS project_title, wp.wedding_date, wp.venue_name, wp.city,
               cu.full_name AS customer_name, cu.phone AS customer_phone
        FROM booking_services bs
        JOIN bookings b ON bs.booking_id = b.id
        JOIN wedding_projects wp ON b.wedding_project_id = wp.id
        JOIN customers c ON b.customer_id = c.id
        JOIN users cu ON c.user_id = cu.id
        WHERE bs.vendor_id = ? AND wp.wedding_date >= CURRENT_DATE
        ORDER BY wp.wedding_date ASC LIMIT 5
      `, [vendorId]);

      return res.json({
        success: true,
        role: 'VENDOR',
        period,
        startDate,
        endDate,
        period_kpis: periodKpis,
        lifetime_kpis: lifetimeKpis[0],
        kpis: {
          new_requests: periodKpis.period_pending_requests,
          confirmed_engagements: periodKpis.period_engagements_count,
          total_contracted_earnings: periodKpis.period_contracted_earnings,
          current_rating: lifetimeKpis[0]?.current_rating || 5.0,
          total_reviews_count: lifetimeKpis[0]?.total_reviews_count || 0
        },
        monthly_trends: monthlyTrends,
        period_engagements: periodEngagements,
        period_requests: periodRequests,
        period_reviews: periodReviews,
        upcoming_engagements: upcomingEngagements
      });

    // -----------------------------------------------------------------------
    // CUSTOMER REPORTS
    // -----------------------------------------------------------------------
    } else if (user.role_name === 'CUSTOMER') {
      const customerId = user.customer_id;
      if (!customerId) return res.status(403).json({ success: false, message: 'Customer record not found.' });

      // Fetch customer wedding details & project
      const [projectRows] = await query(`
        SELECT wp.*, c.partner_name, c.wedding_date AS cust_wedding_date,
               p.agency_name AS planner_agency, pu.full_name AS planner_name, pu.phone AS planner_phone, pu.email AS planner_email,
               b.id AS booking_id, b.status AS booking_status, b.total_amount AS booking_total, b.paid_amount AS booking_paid
        FROM customers c
        LEFT JOIN wedding_projects wp ON wp.customer_id = c.id
        LEFT JOIN planners p ON c.planner_id = p.id
        LEFT JOIN users pu ON p.user_id = pu.id
        LEFT JOIN bookings b ON b.wedding_project_id = wp.id
        WHERE c.id = ?
      `, [customerId]);

      const project = projectRows.length > 0 ? projectRows[0] : null;

      // Calculate days remaining
      let daysRemaining = null;
      const targetDate = project?.wedding_date || user.wedding_date;
      if (targetDate) {
        const diffMs = new Date(targetDate) - new Date();
        daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      }

      // Arranged vendors
      let arrangedVendors = [];
      if (project && project.booking_id) {
        const [services] = await query(`
          SELECT bs.*, v.business_name, v.city AS vendor_city, v.rating AS vendor_rating, sc.name AS category_name
          FROM booking_services bs
          JOIN vendors v ON bs.vendor_id = v.id
          JOIN service_categories sc ON v.category_id = sc.id
          WHERE bs.booking_id = ?
        `, [project.booking_id]);
        arrangedVendors = services;
      }

      // Budget stats
      let budgetSummary = null;
      if (project && project.id) {
        const [bData] = await query('SELECT * FROM budgets WHERE wedding_project_id = ?', [project.id]);
        if (bData.length > 0) budgetSummary = bData[0];
      }

      // Progress calculation
      let progressPercent = 15;
      if (project) {
        if (project.status === 'COMPLETED') progressPercent = 100;
        else if (project.status === 'CONFIRMED') progressPercent = 85;
        else if (project.booking_status === 'PARTIALLY_PAID') progressPercent = 65;
        else if (project.booking_status === 'CUSTOMER_APPROVAL') progressPercent = 45;
        else if (project.status === 'IN_PROGRESS') progressPercent = 35;
      }

      return res.json({
        success: true,
        role: 'CUSTOMER',
        wedding_date: targetDate,
        days_remaining: daysRemaining,
        progress_percentage: progressPercent,
        project_details: project,
        arranged_vendors: arrangedVendors,
        budget_summary: budgetSummary
      });
    }

  } catch (error) {
    console.error('[getReports Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate reports.' });
  }
}

module.exports = {
  getReports
};
