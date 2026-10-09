const { query } = require('../config/db');
const { createNotification } = require('../services/notificationService');
const { parsePagination, buildPaginationResponse, buildOrderBy } = require('../utils/queryHelper');

// Get support tickets (Planner sees all; Customer/Vendor sees own)
// Supports pagination, search, status/category filter, and sorting
async function getSupportTickets(req, res) {
  try {
    const { status, category, priority, search, sort_by } = req.query;
    const { page, limit, offset, isExplicit } = parsePagination(req.query, 10, 50);
    const userId = req.user.id;

    let baseFromWhere = `
      FROM support_requests st
      JOIN users u ON st.user_id = u.id
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN wedding_projects wp ON st.booking_id = wp.id
      LEFT JOIN users planner_u ON st.assigned_to = planner_u.id
      WHERE 1=1
    `;
    const params = [];

    // Customer or Vendor only sees their own tickets
    if (req.user.role_name !== 'PLANNER') {
      baseFromWhere += ` AND st.user_id = ?`;
      params.push(userId);
    }

    if (status) {
      baseFromWhere += ` AND st.status = ?`;
      params.push(status);
    }

    if (category) {
      baseFromWhere += ` AND st.category = ?`;
      params.push(category);
    }

    if (priority) {
      baseFromWhere += ` AND st.priority = ?`;
      params.push(priority);
    }

    if (search) {
      baseFromWhere += ` AND (st.ticket_number LIKE ? OR st.subject LIKE ? OR st.message LIKE ? OR u.full_name LIKE ? OR u.email LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }

    // 1. Total count
    const [countRows] = await query(`SELECT COUNT(*) AS total ${baseFromWhere}`, params);
    const totalCount = countRows[0]?.total || 0;

    // 2. Sorting
    const sortMap = {
      newest: 'st.created_at DESC',
      oldest: 'st.created_at ASC',
      priority: 'FIELD(st.priority, "URGENT", "HIGH", "MEDIUM", "LOW")',
      status: 'FIELD(st.status, "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED")'
    };
    const orderClause = buildOrderBy(sort_by, sortMap, 'st.created_at DESC');

    // 3. Selection
    let selectSql = `
      SELECT st.*, 
             u.full_name, u.email, u.phone, r.name AS role_name,
             wp.title AS project_title, wp.project_code,
             planner_u.full_name AS assigned_planner_name
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
    console.error('[getSupportTickets Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve support tickets.' });
  }
}

// Create support ticket
async function createSupportTicket(req, res) {
  try {
    const { subject, category, priority, message, booking_id } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Subject and message are required.' });
    }

    const ticketNumber = `TCK-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;

    const [result] = await query(
      `INSERT INTO support_requests (user_id, booking_id, ticket_number, subject, category, priority, status, message)
       VALUES (?, ?, ?, ?, ?, ?, 'OPEN', ?)`,
      [req.user.id, booking_id || null, ticketNumber, subject.trim(), category || 'GENERAL', priority || 'MEDIUM', message.trim()]
    );

    const ticketId = result.insertId;

    // Notify Planners in DB
    const [planners] = await query(
      `SELECT u.id FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = 'PLANNER'`
    );
    for (const p of planners) {
      await createNotification({
        userId: p.id,
        title: `New Support Ticket: ${ticketNumber}`,
        message: `${req.user.full_name} submitted a ${priority || 'MEDIUM'} priority ticket regarding "${subject.trim()}".`,
        notificationType: 'SYSTEM',
        referenceId: ticketId,
        referenceType: 'support_ticket'
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Support ticket submitted successfully.',
      ticket_id: ticketId,
      ticket_number: ticketNumber
    });

  } catch (error) {
    console.error('[createSupportTicket Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit ticket.' });
  }
}

// Update support ticket (Planner responds, changes status, assigns, or resolves)
async function updateSupportTicket(req, res) {
  try {
    const { id } = req.params;
    const { status, resolution_notes, response, priority, assigned_to } = req.body;
    const finalNotes = (response || resolution_notes || '').trim();

    const [ticketRows] = await query(
      `SELECT st.*, u.id AS creator_user_id, u.full_name AS creator_name
       FROM support_requests st
       JOIN users u ON st.user_id = u.id
       WHERE st.id = ?`,
      [id]
    );

    if (ticketRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Support ticket not found.' });
    }

    const ticket = ticketRows[0];
    const isResolving = status === 'RESOLVED' || status === 'CLOSED';

    await query(
      `UPDATE support_requests SET
        status = COALESCE(?, status),
        resolution_notes = COALESCE(?, resolution_notes),
        priority = COALESCE(?, priority),
        assigned_to = COALESCE(?, assigned_to),
        resolved_at = CASE WHEN ? = TRUE THEN CURRENT_TIMESTAMP ELSE resolved_at END
       WHERE id = ?`,
      [status || (finalNotes ? 'RESOLVED' : null), finalNotes || null, priority || null, assigned_to || req.user.id, isResolving, id]
    );

    // Notify the Customer creator in DB
    if (resolution_notes || isResolving) {
      const notifTitle = isResolving 
        ? `Support Ticket ${ticket.ticket_number} Resolved` 
        : `Update on Support Ticket ${ticket.ticket_number}`;
      const notifMsg = resolution_notes 
        ? `Planner response: "${resolution_notes.slice(0, 120)}..." Status is now ${status || ticket.status}.`
        : `Your support ticket status has been updated to ${status}.`;

      await createNotification({
        userId: ticket.creator_user_id,
        title: notifTitle,
        message: notifMsg,
        notificationType: 'SYSTEM',
        referenceId: id,
        referenceType: 'support_ticket'
      });
    }

    return res.json({ success: true, message: 'Support ticket updated successfully.' });

  } catch (error) {
    console.error('[updateSupportTicket Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update ticket.' });
  }
}

module.exports = {
  getSupportTickets,
  createSupportTicket,
  updateSupportTicket
};
