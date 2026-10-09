const { query } = require('../config/db');
const { createNotification } = require('../services/notificationService');
const { parsePagination, buildPaginationResponse, buildOrderBy } = require('../utils/queryHelper');

// Planner sends request to vendor
async function createVendorRequest(req, res) {
  try {
    const { wedding_project_id, vendor_id, service_id, event_date, start_time, end_time, proposed_price, notes } = req.body;

    if (!wedding_project_id || !vendor_id || !event_date || !proposed_price) {
      return res.status(400).json({
        success: false,
        message: 'Wedding project ID, vendor ID, event date, and proposed price are required.'
      });
    }

    const plannerId = req.user.planner_id || 1;

    // 1. Verify vendor availability (prevent double booking)
    const [avail] = await query(
      `SELECT status FROM vendor_availability WHERE vendor_id = ? AND date = ?`,
      [vendor_id, event_date]
    );

    if (avail.length > 0 && ['BOOKED', 'UNAVAILABLE'].includes(avail[0].status)) {
      return res.status(409).json({
        success: false,
        message: `This vendor is already ${avail[0].status} on ${event_date}. Please choose another date or vendor.`
      });
    }

    // 2. Generate unique request code
    const requestCode = `REQ-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;

    // 3. Insert vendor request
    const [result] = await query(
      `INSERT INTO vendor_requests (request_code, wedding_project_id, planner_id, vendor_id, service_id, event_date, start_time, end_time, proposed_price, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
      [
        requestCode,
        wedding_project_id,
        plannerId,
        vendor_id,
        service_id || null,
        event_date,
        start_time || '09:00:00',
        end_time || '21:00:00',
        parseFloat(proposed_price),
        notes || null
      ]
    );

    const requestId = result.insertId;

    // 4. Reserve vendor availability temporarily
    await query(
      `INSERT INTO vendor_availability (vendor_id, date, start_time, end_time, status, reason)
       VALUES (?, ?, ?, ?, 'RESERVED', ?)
       ON DUPLICATE KEY UPDATE status = 'RESERVED', reason = VALUES(reason)`,
      [vendor_id, event_date, start_time || '09:00:00', end_time || '21:00:00', `Pending request ${requestCode}`]
    );

    // 5. Notify Vendor
    const [vendUsers] = await query('SELECT user_id, business_name FROM vendors WHERE id = ?', [vendor_id]);
    if (vendUsers.length > 0) {
      await createNotification({
        userId: vendUsers[0].user_id,
        title: 'New Booking Request Received',
        message: `Wedding Planner sent you a booking request (${requestCode}) for ${event_date} (Offer: ₹${Number(proposed_price).toLocaleString('en-IN')}).`,
        notificationType: 'REQUEST_NEW',
        referenceId: requestId,
        referenceType: 'vendor_request'
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Vendor request sent successfully.',
      request_id: requestId,
      request_code: requestCode
    });

  } catch (error) {
    console.error('[createVendorRequest Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to send vendor request.' });
  }
}

// Get all vendor requests (Planner or Vendor view)
async function getVendorRequests(req, res) {
  try {
    const { status, vendor_id, project_id, search, sort_by } = req.query;
    const { page, limit, offset, isExplicit } = parsePagination(req.query, 10, 100);

    let baseFromWhere = `
      FROM vendor_requests vr
      JOIN wedding_projects wp ON vr.wedding_project_id = wp.id
      JOIN customers c ON wp.customer_id = c.id
      JOIN users cu ON c.user_id = cu.id
      JOIN vendors v ON vr.vendor_id = v.id
      JOIN service_categories sc ON v.category_id = sc.id
      JOIN planners p ON vr.planner_id = p.id
      JOIN users pu ON p.user_id = pu.id
      LEFT JOIN vendor_services vs ON vr.service_id = vs.id
      WHERE 1=1
    `;
    const params = [];

    // Role filtering: if logged-in user is a VENDOR, show only their requests
    if (req.user.role_name === 'VENDOR' && req.user.vendor_id) {
      baseFromWhere += ` AND vr.vendor_id = ?`;
      params.push(req.user.vendor_id);
    } else if (vendor_id) {
      baseFromWhere += ` AND vr.vendor_id = ?`;
      params.push(vendor_id);
    }

    if (project_id) {
      baseFromWhere += ` AND vr.wedding_project_id = ?`;
      params.push(project_id);
    }

    if (status) {
      baseFromWhere += ` AND vr.status = ?`;
      params.push(status);
    }

    if (search) {
      baseFromWhere += ` AND (vr.request_code LIKE ? OR wp.title LIKE ? OR v.business_name LIKE ? OR sc.name LIKE ? OR cu.full_name LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }

    // 1. Total count
    const [countRows] = await query(`SELECT COUNT(*) AS total ${baseFromWhere}`, params);
    const totalCount = countRows[0]?.total || 0;

    // 2. Sorting
    const sortMap = {
      newest: 'vr.created_at DESC',
      event_date_asc: 'vr.event_date ASC',
      event_date_desc: 'vr.event_date DESC',
      price_desc: 'vr.proposed_price DESC',
      price_asc: 'vr.proposed_price ASC'
    };
    const orderClause = buildOrderBy(sort_by, sortMap, 'vr.created_at DESC');

    // 3. Selection query
    let selectSql = `
      SELECT vr.*,
             wp.project_code, wp.title AS project_title, wp.wedding_date AS project_wedding_date, wp.city AS project_city,
             v.business_name, v.city AS vendor_city, sc.name AS category_name,
             p.agency_name AS planner_agency, pu.full_name AS planner_name, pu.email AS planner_email, pu.phone AS planner_phone,
             vs.name AS service_name, vs.price AS service_catalog_price,
             c.id AS customer_id, c.partner_name, cu.full_name AS customer_name
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
    console.error('[getVendorRequests Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve vendor requests.' });
  }
}

// Vendor accepts request
async function acceptVendorRequest(req, res) {
  try {
    const { id } = req.params;

    // Verify request exists and is PENDING
    const [reqRows] = await query(
      `SELECT vr.*, wp.title AS project_title, v.business_name, v.user_id AS vendor_user_id, p.user_id AS planner_user_id
       FROM vendor_requests vr
       JOIN wedding_projects wp ON vr.wedding_project_id = wp.id
       JOIN vendors v ON vr.vendor_id = v.id
       JOIN planners p ON vr.planner_id = p.id
       WHERE vr.id = ?`,
      [id]
    );

    if (reqRows.length === 0) return res.status(404).json({ success: false, message: 'Request not found.' });

    const request = reqRows[0];

    // Authorization check
    if (req.user.role_name === 'VENDOR' && req.user.id !== request.vendor_user_id) {
      return res.status(403).json({ success: false, message: 'Forbidden. You cannot accept requests for another vendor.' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: `Request is already ${request.status}.` });
    }

    // Update request status to ACCEPTED
    await query(
      `UPDATE vendor_requests SET status = 'ACCEPTED', responded_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [id]
    );

    // Update vendor availability to BOOKED
    await query(
      `UPDATE vendor_availability SET status = 'BOOKED', reason = ? WHERE vendor_id = ? AND date = ?`,
      [`Booked for Project: ${request.project_title}`, request.vendor_id, request.event_date]
    );

    // Notify Planner
    await createNotification({
      userId: request.planner_user_id,
      title: 'Vendor Accepted Request!',
      message: `${request.business_name} accepted booking request ${request.request_code} for ${request.event_date} (₹${Number(request.proposed_price).toLocaleString('en-IN')}). You can now arrange this vendor in the customer proposal.`,
      notificationType: 'REQUEST_ACCEPTED',
      referenceId: id,
      referenceType: 'vendor_request'
    });

    return res.json({
      success: true,
      message: 'Booking request accepted successfully.'
    });

  } catch (error) {
    console.error('[acceptVendorRequest Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to accept request.' });
  }
}

// Vendor declines request (Mandatory decline reason)
async function declineVendorRequest(req, res) {
  try {
    const { id } = req.params;
    const { decline_reason } = req.body;

    if (!decline_reason || decline_reason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'A decline reason is mandatory when declining a booking request.'
      });
    }

    const [reqRows] = await query(
      `SELECT vr.*, wp.title AS project_title, v.business_name, v.user_id AS vendor_user_id, p.user_id AS planner_user_id
       FROM vendor_requests vr
       JOIN wedding_projects wp ON vr.wedding_project_id = wp.id
       JOIN vendors v ON vr.vendor_id = v.id
       JOIN planners p ON vr.planner_id = p.id
       WHERE vr.id = ?`,
      [id]
    );

    if (reqRows.length === 0) return res.status(404).json({ success: false, message: 'Request not found.' });

    const request = reqRows[0];

    // Authorization check
    if (req.user.role_name === 'VENDOR' && req.user.id !== request.vendor_user_id) {
      return res.status(403).json({ success: false, message: 'Forbidden. You cannot decline requests for another vendor.' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: `Request is already ${request.status}.` });
    }

    // Update request status to DECLINED with decline reason
    await query(
      `UPDATE vendor_requests SET status = 'DECLINED', decline_reason = ?, responded_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [decline_reason.trim(), id]
    );

    // Release vendor availability if it was reserved
    await query(
      `UPDATE vendor_availability SET status = 'AVAILABLE', reason = NULL WHERE vendor_id = ? AND date = ? AND status = 'RESERVED'`,
      [request.vendor_id, request.event_date]
    );

    // Notify Planner immediately so planner can select another vendor
    await createNotification({
      userId: request.planner_user_id,
      title: 'Vendor Declined Request',
      message: `${request.business_name} declined request ${request.request_code} for ${request.event_date}. Reason: "${decline_reason.trim()}". You can now search and assign a replacement vendor.`,
      notificationType: 'REQUEST_DECLINED',
      referenceId: id,
      referenceType: 'vendor_request'
    });

    return res.json({
      success: true,
      message: 'Booking request declined. The planner has been notified.'
    });

  } catch (error) {
    console.error('[declineVendorRequest Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to decline request.' });
  }
}

// Planner arranges accepted vendor into Booking Proposal
async function arrangeAcceptedVendor(req, res) {
  try {
    const { request_id } = req.body;

    const [rRows] = await query(
      `SELECT vr.*, v.business_name, sc.name AS category_name, vs.name AS service_name
       FROM vendor_requests vr
       JOIN vendors v ON vr.vendor_id = v.id
       JOIN service_categories sc ON v.category_id = sc.id
       LEFT JOIN vendor_services vs ON vr.service_id = vs.id
       WHERE vr.id = ? AND vr.status = 'ACCEPTED'`,
      [request_id]
    );

    if (rRows.length === 0) {
      return res.status(400).json({ success: false, message: 'Accepted vendor request not found.' });
    }

    const request = rRows[0];

    // Find active booking for this project
    const [bRows] = await query('SELECT id FROM bookings WHERE wedding_project_id = ?', [request.wedding_project_id]);
    if (bRows.length === 0) {
      return res.status(400).json({ success: false, message: 'No active booking found for this project.' });
    }

    const bookingId = bRows[0].id;

    // Check if already arranged
    const [existing] = await query(
      'SELECT id FROM booking_services WHERE booking_id = ? AND vendor_id = ?',
      [bookingId, request.vendor_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'This vendor has already been arranged in this booking.' });
    }

    // Insert into booking_services
    await query(
      `INSERT INTO booking_services (booking_id, vendor_id, vendor_request_id, service_id, service_name, category_name, agreed_price, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'PROPOSED', ?)`,
      [
        bookingId,
        request.vendor_id,
        request.id,
        request.service_id || null,
        request.service_name || `${request.category_name} Package`,
        request.category_name,
        request.proposed_price,
        request.notes
      ]
    );

    // Recalculate booking total
    const [sumRows] = await query(
      'SELECT SUM(agreed_price) AS total FROM booking_services WHERE booking_id = ?',
      [bookingId]
    );
    const totalAmount = sumRows[0].total || 0;
    const advanceAmount = totalAmount * 0.3; // 30% advance standard

    await query(
      `UPDATE bookings SET total_amount = ?, advance_amount = ?, status = 'CUSTOMER_APPROVAL' WHERE id = ?`,
      [totalAmount, advanceAmount, bookingId]
    );

    // Notify Customer to review arrangement
    const [custRows] = await query(
      `SELECT c.user_id FROM bookings b JOIN customers c ON b.customer_id = c.id WHERE b.id = ?`,
      [bookingId]
    );
    if (custRows.length > 0) {
      await createNotification({
        userId: custRows[0].user_id,
        title: 'New Vendor Arrangement Ready for Review',
        message: `Your wedding planner has arranged ${request.business_name} (${request.category_name}). Please review and approve the proposal.`,
        notificationType: 'CUSTOMER_APPROVAL',
        referenceId: bookingId,
        referenceType: 'booking'
      });
    }

    return res.json({
      success: true,
      message: 'Vendor successfully arranged and submitted for Customer Approval.'
    });

  } catch (error) {
    console.error('[arrangeAcceptedVendor Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to arrange vendor.' });
  }
}

module.exports = {
  createVendorRequest,
  getVendorRequests,
  acceptVendorRequest,
  declineVendorRequest,
  arrangeAcceptedVendor
};
