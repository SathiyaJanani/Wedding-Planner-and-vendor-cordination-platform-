const { query } = require('../config/db');
const { createNotification } = require('../services/notificationService');
const { parsePagination, buildPaginationResponse, buildOrderBy } = require('../utils/queryHelper');

// Get all bookings (Planner view)
async function getAllBookings(req, res) {
  try {
    const { status, customer_id, project_id, search, sort_by } = req.query;
    const { page, limit, offset, isExplicit } = parsePagination(req.query, 10, 100);

    let baseFromWhere = `
      FROM bookings b
      JOIN wedding_projects wp ON b.wedding_project_id = wp.id
      JOIN customers c ON b.customer_id = c.id
      JOIN users cu ON c.user_id = cu.id
      JOIN planners p ON b.planner_id = p.id
      JOIN users pu ON p.user_id = pu.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      baseFromWhere += ` AND b.status = ?`;
      params.push(status);
    }

    if (customer_id) {
      baseFromWhere += ` AND b.customer_id = ?`;
      params.push(customer_id);
    }

    if (project_id) {
      baseFromWhere += ` AND b.wedding_project_id = ?`;
      params.push(project_id);
    }

    if (search) {
      baseFromWhere += ` AND (b.booking_code LIKE ? OR wp.title LIKE ? OR cu.full_name LIKE ? OR cu.phone LIKE ? OR wp.project_code LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }

    // 1. Total count
    const [countRows] = await query(`SELECT COUNT(*) AS total ${baseFromWhere}`, params);
    const totalCount = countRows[0]?.total || 0;

    // 2. Sorting
    const sortMap = {
      newest: 'b.created_at DESC',
      oldest: 'b.created_at ASC',
      date_asc: 'wp.wedding_date ASC',
      date_desc: 'wp.wedding_date DESC',
      amount_desc: 'b.total_amount DESC',
      amount_asc: 'b.total_amount ASC'
    };
    const orderClause = buildOrderBy(sort_by, sortMap, 'b.created_at DESC');

    // 3. Selection query
    let selectSql = `
      SELECT b.*,
             wp.project_code, wp.title AS project_title, wp.wedding_date, wp.city,
             c.partner_name, cu.full_name AS customer_name, cu.email AS customer_email, cu.phone AS customer_phone,
             p.agency_name AS planner_agency, pu.full_name AS planner_name,
             (SELECT COUNT(*) FROM booking_services WHERE booking_id = b.id) AS arranged_vendors_count,
             (SELECT COUNT(*) FROM payments WHERE booking_id = b.id AND status = 'SUCCESS') AS successful_payments_count
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
    console.error('[getAllBookings Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve bookings.' });
  }
}

// Get booking details by ID
async function getBookingById(req, res) {
  try {
    const { id } = req.params;

    const [bRows] = await query(
      `SELECT b.*,
              wp.project_code, wp.title AS project_title, wp.wedding_date, wp.venue_name, wp.venue_address, wp.city,
              c.id AS customer_id, c.partner_name, c.wedding_theme,
              cu.id AS customer_user_id, cu.full_name AS customer_name, cu.email AS customer_email, cu.phone AS customer_phone,
              p.id AS planner_id, p.agency_name AS planner_agency,
              pu.full_name AS planner_name, pu.email AS planner_email, pu.phone AS planner_phone
       FROM bookings b
       LEFT JOIN wedding_projects wp ON b.wedding_project_id = wp.id
       JOIN customers c ON b.customer_id = c.id
       JOIN users cu ON c.user_id = cu.id
       LEFT JOIN planners p ON b.planner_id = p.id
       LEFT JOIN users pu ON p.user_id = pu.id
       WHERE b.id = ?`,
      [id]
    );

    if (bRows.length === 0) return res.status(404).json({ success: false, message: 'Booking not found.' });

    const booking = bRows[0];

    // Fetch booking services (vendors arranged)
    const [services] = await query(
      `SELECT bs.*, v.business_name, v.city AS vendor_city, v.rating AS vendor_rating,
              vu.full_name AS vendor_contact, vu.email AS vendor_email, vu.phone AS vendor_phone,
              COALESCE(sc.name, bs.category_name, 'Artisan Service') AS category_name,
              sc.slug AS category_slug, sc.icon AS category_icon
       FROM booking_services bs
       JOIN vendors v ON bs.vendor_id = v.id
       LEFT JOIN users vu ON v.user_id = vu.id
       LEFT JOIN service_categories sc ON v.category_id = sc.id
       WHERE bs.booking_id = ?`,
      [id]
    );
    booking.services = services;

    // Fetch payments milestones
    const [payments] = await query(
      `SELECT p.*,
              (SELECT transaction_reference FROM payment_transactions WHERE payment_id = p.id ORDER BY id DESC LIMIT 1) AS transaction_reference,
              (SELECT payment_method FROM payment_transactions WHERE payment_id = p.id ORDER BY id DESC LIMIT 1) AS payment_method
       FROM payments p
       WHERE p.booking_id = ?
       ORDER BY p.due_date ASC`,
      [id]
    );
    booking.payments = payments;

    return res.json({ success: true, data: booking });

  } catch (error) {
    console.error('[getBookingById Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve booking details.' });
  }
}

// Customer reviews and APPROVES vendor arrangement
async function approveBookingArrangement(req, res) {
  try {
    const { id } = req.params;

    const [bRows] = await query(
      `SELECT b.*, p.user_id AS planner_user_id, wp.title AS project_title, wp.wedding_date
       FROM bookings b
       LEFT JOIN planners p ON b.planner_id = p.id
       LEFT JOIN wedding_projects wp ON b.wedding_project_id = wp.id
       WHERE b.id = ?`,
      [id]
    );

    if (bRows.length === 0) return res.status(404).json({ success: false, message: 'Booking not found.' });

    const booking = bRows[0];

    // Update booking services status to CUSTOMER_APPROVED
    await query(`UPDATE booking_services SET status = 'CUSTOMER_APPROVED' WHERE booking_id = ?`, [id]);

    // Update booking status to PAYMENT_PENDING
    await query(`UPDATE bookings SET status = 'PAYMENT_PENDING' WHERE id = ?`, [id]);

    // Automatically generate 3 Milestone Payments (Advance 30%, Second 40%, Final 30%)
    const total = parseFloat(booking.total_amount) || 100000;
    const advance = Math.round(total * 0.3);
    const second = Math.round(total * 0.4);
    const final = total - advance - second;

    const weddingDate = new Date(booking.wedding_date);
    const advanceDate = new Date().toISOString().split('T')[0];
    const secondDate = new Date(weddingDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const finalDate = new Date(weddingDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Check if payments already exist
    const [existingPayments] = await query('SELECT id FROM payments WHERE booking_id = ?', [id]);
    if (existingPayments.length === 0) {
      const year = new Date().getFullYear();
      await query(
        `INSERT INTO payments (payment_code, booking_id, wedding_project_id, customer_id, title, milestone_name, amount, due_date, status)
         VALUES 
         (?, ?, ?, ?, 'Wedding Booking Advance Retainer', 'Advance', ?, ?, 'PENDING'),
         (?, ?, ?, ?, 'Mid-Term Vendor Milestone', 'Second Payment', ?, ?, 'PENDING'),
         (?, ?, ?, ?, 'Final Pre-Wedding Settlement', 'Final Payment', ?, ?, 'PENDING')`,
        [
          `PAY-${year}-${booking.id}-ADV`, booking.id, booking.wedding_project_id, booking.customer_id, advance, advanceDate,
          `PAY-${year}-${booking.id}-MID`, booking.id, booking.wedding_project_id, booking.customer_id, second, secondDate,
          `PAY-${year}-${booking.id}-FIN`, booking.id, booking.wedding_project_id, booking.customer_id, final, finalDate
        ]
      );
    }

    // Notify Planner if assigned
    if (booking.planner_user_id) {
      await createNotification({
        userId: booking.planner_user_id,
        title: 'Customer Approved Vendor Arrangement!',
        message: `Customer approved the vendor arrangement for "${booking.project_title || 'Wedding'}". The booking status is now PAYMENT_PENDING.`,
        notificationType: 'CUSTOMER_APPROVED',
        referenceId: id,
        referenceType: 'booking'
      });
    }

    return res.json({
      success: true,
      message: 'Vendor arrangement approved! Milestone payment schedules generated. Please proceed to payment.'
    });

  } catch (error) {
    console.error('[approveBookingArrangement Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to approve arrangement.' });
  }
}

// Customer requests changes to vendor arrangement
async function requestBookingChanges(req, res) {
  try {
    const { id } = req.params;
    const { change_notes } = req.body;

    if (!change_notes || change_notes.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please specify the changes or vendors you would like replaced.' });
    }

    const [bRows] = await query(
      `SELECT b.*, p.user_id AS planner_user_id, wp.title AS project_title
       FROM bookings b
       JOIN planners p ON b.planner_id = p.id
       JOIN wedding_projects wp ON b.wedding_project_id = wp.id
       WHERE b.id = ?`,
      [id]
    );

    if (bRows.length === 0) return res.status(404).json({ success: false, message: 'Booking not found.' });

    const booking = bRows[0];

    // Update booking services and booking status
    await query(`UPDATE booking_services SET status = 'CUSTOMER_CHANGE_REQUESTED' WHERE booking_id = ?`, [id]);
    await query(`UPDATE bookings SET status = 'DRAFT', customer_feedback = ? WHERE id = ?`, [change_notes.trim(), id]);

    // Notify Planner
    await createNotification({
      userId: booking.planner_user_id,
      title: 'Customer Requested Vendor Changes',
      message: `Customer requested adjustments on project "${booking.project_title}": "${change_notes.trim()}". Please coordinate replacement vendors.`,
      notificationType: 'CUSTOMER_CHANGE_REQUESTED',
      referenceId: id,
      referenceType: 'booking'
    });

    return res.json({
      success: true,
      message: 'Change request submitted to your Wedding Planner. They will suggest replacement vendors.'
    });

  } catch (error) {
    console.error('[requestBookingChanges Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit change request.' });
  }
}

// Customer gets active booking
async function getMyBooking(req, res) {
  try {
    const [cRows] = await query('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
    if (cRows.length === 0) return res.status(404).json({ success: false, message: 'Customer record not found.' });

    const [bRows] = await query('SELECT id FROM bookings WHERE customer_id = ? ORDER BY id DESC LIMIT 1', [cRows[0].id]);
    if (bRows.length === 0) {
      return res.json({ success: true, data: null, message: 'No active booking found.' });
    }

    req.params.id = bRows[0].id;
    return getBookingById(req, res);

  } catch (error) {
    console.error('[getMyBooking Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch customer booking.' });
  }
}

// Vendor gets assigned bookings
async function getVendorBookings(req, res) {
  try {
    const vendorId = req.user.vendor_id;
    if (!vendorId) return res.status(403).json({ success: false, message: 'Vendor profile not found.' });

    const { search, status, sort_by } = req.query;
    const { page, limit, offset, isExplicit } = parsePagination(req.query, 10, 100);

    let baseFromWhere = `
      FROM booking_services bs
      JOIN bookings b ON bs.booking_id = b.id
      JOIN wedding_projects wp ON b.wedding_project_id = wp.id
      JOIN customers c ON b.customer_id = c.id
      JOIN users cu ON c.user_id = cu.id
      JOIN planners p ON b.planner_id = p.id
      JOIN users pu ON p.user_id = pu.id
      WHERE bs.vendor_id = ?
    `;
    const params = [vendorId];

    if (status) {
      baseFromWhere += ` AND (bs.status = ? OR b.status = ?)`;
      params.push(status, status);
    }

    if (search) {
      baseFromWhere += ` AND (b.booking_code LIKE ? OR wp.title LIKE ? OR cu.full_name LIKE ? OR wp.city LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    const [countRows] = await query(`SELECT COUNT(*) AS total ${baseFromWhere}`, params);
    const totalCount = countRows[0]?.total || 0;

    const sortMap = {
      date_asc: 'wp.wedding_date ASC',
      date_desc: 'wp.wedding_date DESC',
      price_desc: 'bs.agreed_price DESC',
      price_asc: 'bs.agreed_price ASC',
      newest: 'b.id DESC'
    };
    const orderClause = buildOrderBy(sort_by, sortMap, 'wp.wedding_date ASC');

    let selectSql = `
      SELECT bs.id AS booking_service_id, bs.service_name, bs.category_name, bs.agreed_price, bs.status AS service_status,
             b.id AS booking_id, b.booking_code, b.status AS booking_status,
             wp.id AS project_id, wp.title AS project_title, wp.wedding_date, wp.venue_name, wp.city,
             c.partner_name, cu.full_name AS customer_name, cu.phone AS customer_phone,
             p.agency_name AS planner_agency, pu.full_name AS planner_name, pu.phone AS planner_phone
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
    console.error('[getVendorBookings Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch vendor bookings.' });
  }
}

// Update booking status (e.g. mark CONFIRMED, SERVICE_IN_PROGRESS, COMPLETED)
async function updateBookingStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      'DRAFT', 'REQUESTED', 'PENDING_VENDOR_RESPONSE', 'VENDOR_ACCEPTED',
      'CUSTOMER_APPROVAL', 'PAYMENT_PENDING', 'PARTIALLY_PAID', 'FULLY_PAID',
      'CONFIRMED', 'SERVICE_IN_PROGRESS', 'COMPLETED', 'CANCELLED'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid booking status.' });
    }

    await query(`UPDATE bookings SET status = ? WHERE id = ?`, [status, id]);

    // If marked COMPLETED, update wedding_project status to COMPLETED
    if (status === 'COMPLETED') {
      const [bRows] = await query('SELECT wedding_project_id, customer_id FROM bookings WHERE id = ?', [id]);
      if (bRows.length > 0) {
        await query(`UPDATE wedding_projects SET status = 'COMPLETED' WHERE id = ?`, [bRows[0].wedding_project_id]);
        // Notify Customer for review
        const [cUsers] = await query('SELECT user_id FROM customers WHERE id = ?', [bRows[0].customer_id]);
        if (cUsers.length > 0) {
          await createNotification({
            userId: cUsers[0].user_id,
            title: 'Wedding Services Completed! Leave a Review',
            message: 'Your wedding services have been marked as completed. We would love to hear your feedback on your Planner and Vendors.',
            notificationType: 'REVIEW_REQUESTED',
            referenceId: id,
            referenceType: 'booking'
          });
        }
      }
    }

    return res.json({ success: true, message: `Booking status updated to ${status}.` });

  } catch (error) {
    console.error('[updateBookingStatus Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update booking status.' });
  }
}

// Customer selects a vendor for their wedding
async function selectVendorForCustomer(req, res) {
  try {
    const { vendor_id, service_id, agreed_price } = req.body;
    if (!vendor_id) {
      return res.status(400).json({ success: false, message: 'Vendor ID is required.' });
    }

    const [cRows] = await query('SELECT id, planner_id, wedding_date, partner_name FROM customers WHERE user_id = ?', [req.user.id]);
    if (cRows.length === 0) return res.status(403).json({ success: false, message: 'Customer record not found.' });
    const customer = cRows[0];

    // 1. Fetch vendor details
    const [vRows] = await query(
      `SELECT v.*, sc.name AS category_name 
       FROM vendors v 
       LEFT JOIN service_categories sc ON v.category_id = sc.id 
       WHERE v.id = ?`,
      [vendor_id]
    );
    if (vRows.length === 0) return res.status(404).json({ success: false, message: 'Vendor not found.' });
    const vendor = vRows[0];

    // 2. Find or create wedding project
    let [wpRows] = await query('SELECT id, planner_id, title FROM wedding_projects WHERE customer_id = ? ORDER BY id DESC LIMIT 1', [customer.id]);
    let projectId;
    let plannerId = customer.planner_id || 1;
    let projectTitle = 'Dream Wedding Celebration';

    if (wpRows.length === 0) {
      const year = new Date().getFullYear();
      const code = `WP-${year}-${String(Math.floor(1000 + Math.random() * 9000))}`;
      const [wpRes] = await query(
        `INSERT INTO wedding_projects (project_code, customer_id, planner_id, title, wedding_date, city, total_budget, status)
         VALUES (?, ?, ?, ?, ?, 'Bangalore', 1500000, 'PLANNING')`,
        [code, customer.id, plannerId, `${req.user.full_name}'s Wedding`, customer.wedding_date || '2026-12-15']
      );
      projectId = wpRes.insertId;
      projectTitle = `${req.user.full_name}'s Wedding`;
    } else {
      projectId = wpRows[0].id;
      plannerId = wpRows[0].planner_id || plannerId;
      projectTitle = wpRows[0].title || projectTitle;
    }

    // 3. Find or create booking
    let [bRows] = await query('SELECT id FROM bookings WHERE customer_id = ? ORDER BY id DESC LIMIT 1', [customer.id]);
    let bookingId;

    if (bRows.length === 0) {
      const year = new Date().getFullYear();
      const bCode = `BK-${year}-${String(Math.floor(1000 + Math.random() * 9000))}`;
      const [bRes] = await query(
        `INSERT INTO bookings (booking_code, wedding_project_id, customer_id, planner_id, total_amount, advance_amount, paid_amount, status, customer_feedback)
         VALUES (?, ?, ?, ?, 0, 0, 0, 'CUSTOMER_APPROVAL', 'Vendor selection in progress.')`,
        [bCode, projectId, customer.id, plannerId]
      );
      bookingId = bRes.insertId;
    } else {
      bookingId = bRows[0].id;
    }

    // 4. Check if vendor is already in booking_services
    const [existingServices] = await query(
      `SELECT id FROM booking_services WHERE booking_id = ? AND vendor_id = ?`,
      [bookingId, vendor_id]
    );

    const price = agreed_price ? parseFloat(agreed_price) : parseFloat(vendor.base_price || 25000);
    const categoryName = vendor.category_name || 'Artisan Service';
    const serviceName = vendor.category_name ? `${vendor.category_name} Package` : 'Wedding Artisan Service';

    if (existingServices.length > 0) {
      await query(
        `UPDATE booking_services SET status = 'CUSTOMER_APPROVED', agreed_price = ?, category_name = ? WHERE id = ?`,
        [price, categoryName, existingServices[0].id]
      );
    } else {
      await query(
        `INSERT INTO booking_services (booking_id, vendor_id, service_id, service_name, category_name, agreed_price, status)
         VALUES (?, ?, ?, ?, ?, ?, 'CUSTOMER_APPROVED')`,
        [bookingId, vendor_id, service_id || null, serviceName, categoryName, price]
      );
    }

    // 5. Recalculate consolidated booking total
    const [totalRows] = await query(
      `SELECT COALESCE(SUM(agreed_price), 0) AS total_amount FROM booking_services WHERE booking_id = ?`,
      [bookingId]
    );
    const newTotal = totalRows[0]?.total_amount || 0;
    await query(`UPDATE bookings SET total_amount = ? WHERE id = ?`, [newTotal, bookingId]);

    // 6. Notify assigned Planner
    const [planners] = await query('SELECT user_id FROM planners WHERE id = ?', [plannerId]);
    if (planners.length > 0) {
      await createNotification({
        userId: planners[0].user_id,
        title: 'Customer Selected Vendor',
        message: `${req.user.full_name} selected "${vendor.business_name}" (${vendor.category_name || 'Vendor'}) for project "${projectTitle}".`,
        notificationType: 'CUSTOMER_APPROVED',
        referenceId: bookingId,
        referenceType: 'booking'
      });
    }

    return res.json({
      success: true,
      message: `"${vendor.business_name}" has been added to your wedding team!`,
      booking_id: bookingId,
      vendor_id: vendor_id,
      total_amount: newTotal
    });

  } catch (error) {
    console.error('[selectVendorForCustomer Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to select vendor for wedding.' });
  }
}

// Customer removes a vendor from their wedding booking
async function removeVendorFromCustomerBooking(req, res) {
  try {
    const { vendor_id, service_id } = req.body;
    if (!vendor_id && !service_id) {
      return res.status(400).json({ success: false, message: 'Vendor ID or Service ID is required.' });
    }

    const [cRows] = await query('SELECT id, planner_id FROM customers WHERE user_id = ?', [req.user.id]);
    if (cRows.length === 0) return res.status(403).json({ success: false, message: 'Customer record not found.' });
    const customer = cRows[0];

    const [bRows] = await query('SELECT id, planner_id, wedding_project_id FROM bookings WHERE customer_id = ? ORDER BY id DESC LIMIT 1', [customer.id]);
    if (bRows.length === 0) return res.status(404).json({ success: false, message: 'No active booking found.' });
    const booking = bRows[0];

    // Remove from booking_services
    if (vendor_id) {
      await query(`DELETE FROM booking_services WHERE vendor_id = ? AND booking_id = ?`, [vendor_id, booking.id]);
    } else if (service_id) {
      await query(`DELETE FROM booking_services WHERE id = ? AND booking_id = ?`, [service_id, booking.id]);
    }

    // Recalculate consolidated booking total
    const [totalRows] = await query(
      `SELECT COALESCE(SUM(agreed_price), 0) AS total_amount FROM booking_services WHERE booking_id = ?`,
      [booking.id]
    );
    const newTotal = totalRows[0]?.total_amount || 0;
    await query(`UPDATE bookings SET total_amount = ? WHERE id = ?`, [newTotal, booking.id]);

    // Notify Planner
    const [planners] = await query('SELECT user_id FROM planners WHERE id = ?', [booking.planner_id || customer.planner_id || 1]);
    if (planners.length > 0) {
      await createNotification({
        userId: planners[0].user_id,
        title: 'Customer Removed Vendor',
        message: `${req.user.full_name} removed a vendor from their wedding proposal. Updated total: ₹${Number(newTotal).toLocaleString('en-IN')}`,
        notificationType: 'SYSTEM',
        referenceId: booking.id,
        referenceType: 'booking'
      });
    }

    return res.json({
      success: true,
      message: 'Vendor removed from your wedding team.',
      total_amount: newTotal
    });

  } catch (error) {
    console.error('[removeVendorFromCustomerBooking Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to remove vendor from booking.' });
  }
}

// Get Selected Vendors with full details for Planner portal
// Required fields: Vendor, Service, Category, Wedding, Event date, Location, Amount, Booking status, Payment status, Vendor status
// Supports: pagination, search, sorting, filtering (category, booking status, payment status, date)
async function getSelectedVendors(req, res) {
  try {
    const { category, booking_status, payment_status, date, search, sort_by } = req.query;
    const { page, limit, offset, isExplicit } = parsePagination(req.query, 10, 50);

    let baseFromWhere = `
      FROM booking_services bs
      JOIN bookings b ON bs.booking_id = b.id
      JOIN wedding_projects wp ON b.wedding_project_id = wp.id
      JOIN customers c ON b.customer_id = c.id
      JOIN users cu ON c.user_id = cu.id
      JOIN vendors v ON bs.vendor_id = v.id
      JOIN service_categories sc ON v.category_id = sc.id
      JOIN users vu ON v.user_id = vu.id
      LEFT JOIN vendor_requests vr ON bs.vendor_request_id = vr.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      baseFromWhere += ` AND (sc.name = ? OR sc.slug = ? OR bs.category_name = ?)`;
      params.push(category, category, category);
    }

    if (booking_status) {
      baseFromWhere += ` AND b.status = ?`;
      params.push(booking_status);
    }

    if (payment_status) {
      if (payment_status === 'FULLY_PAID') {
        baseFromWhere += ` AND bs.paid_amount >= bs.agreed_price AND bs.agreed_price > 0`;
      } else if (payment_status === 'PARTIALLY_PAID') {
        baseFromWhere += ` AND bs.paid_amount > 0 AND bs.paid_amount < bs.agreed_price`;
      } else if (payment_status === 'PENDING') {
        baseFromWhere += ` AND (bs.paid_amount = 0 OR bs.paid_amount IS NULL)`;
      }
    }

    if (date) {
      baseFromWhere += ` AND (wp.wedding_date = ? OR vr.event_date = ?)`;
      params.push(date, date);
    }

    if (search) {
      baseFromWhere += ` AND (
        v.business_name LIKE ? OR 
        bs.service_name LIKE ? OR 
        sc.name LIKE ? OR 
        wp.title LIKE ? OR 
        wp.project_code LIKE ? OR 
        cu.full_name LIKE ?
      )`;
      const term = `%${search}%`;
      params.push(term, term, term, term, term, term);
    }

    // 1. Total count
    const [countRows] = await query(`SELECT COUNT(*) AS total ${baseFromWhere}`, params);
    const totalCount = countRows[0]?.total || 0;

    // 2. Sorting
    const sortMap = {
      vendor_asc: 'v.business_name ASC',
      vendor_desc: 'v.business_name DESC',
      amount_asc: 'bs.agreed_price ASC',
      amount_desc: 'bs.agreed_price DESC',
      date_asc: 'COALESCE(vr.event_date, wp.wedding_date) ASC',
      date_desc: 'COALESCE(vr.event_date, wp.wedding_date) DESC',
      status_asc: 'b.status ASC',
      status_desc: 'b.status DESC',
      newest: 'bs.id DESC'
    };
    const orderClause = buildOrderBy(sort_by, sortMap, 'bs.id DESC');

    // 3. Selection query
    let selectSql = `
      SELECT bs.id, bs.booking_id, bs.vendor_id, bs.service_id, bs.service_name, bs.category_name, 
             bs.agreed_price AS amount, bs.paid_amount,
             (bs.agreed_price - bs.paid_amount) AS pending_amount,
             bs.status AS service_status,
             b.booking_code, b.status AS booking_status, b.total_amount AS booking_total_amount, b.paid_amount AS booking_paid_amount,
             wp.project_code, wp.title AS project_title, wp.wedding_date, wp.venue_name, wp.city AS location,
             c.partner_name, cu.full_name AS customer_name, cu.email AS customer_email, cu.phone AS customer_phone,
             v.business_name AS vendor_name, v.city AS vendor_city, v.rating AS vendor_rating,
             vu.full_name AS vendor_contact_name, vu.email AS vendor_email, vu.phone AS vendor_phone,
             sc.name AS category,
             COALESCE(vr.event_date, wp.wedding_date) AS event_date,
             COALESCE(vr.status, 'ACCEPTED') AS vendor_status,
             CASE 
               WHEN bs.paid_amount >= bs.agreed_price AND bs.agreed_price > 0 THEN 'FULLY_PAID'
               WHEN bs.paid_amount > 0 THEN 'PARTIALLY_PAID'
               ELSE 'PENDING'
             END AS payment_status
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
    console.error('[getSelectedVendors Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve selected vendors.' });
  }
}

module.exports = {
  getAllBookings,
  getBookingById,
  approveBookingArrangement,
  requestBookingChanges,
  getMyBooking,
  getVendorBookings,
  updateBookingStatus,
  selectVendorForCustomer,
  removeVendorFromCustomerBooking,
  getSelectedVendors
};
