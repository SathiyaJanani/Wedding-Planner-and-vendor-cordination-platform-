const { query } = require('../config/db');
const { createNotification } = require('../services/notificationService');
const { parsePagination, buildPaginationResponse, buildOrderBy } = require('../utils/queryHelper');

// Customer submits or drafts wedding requirements
async function submitRequirements(req, res) {
  try {
    const wedding_date = req.body.wedding_date || req.body.event_date;
    const location = req.body.location || req.body.city || 'Bangalore';
    const guest_count = req.body.guest_count || 300;
    const estimated_budget = req.body.estimated_budget || req.body.budget_max || req.body.budget_min || 1500000;
    const required_services = req.body.required_services || req.body.ceremony_types || ['Venue', 'Catering', 'Photography', 'Decor'];
    const special_preferences = req.body.special_preferences || req.body.notes || req.body.theme_preferences || '';
    const status = req.body.status === 'DRAFT' ? 'DRAFT' : 'SUBMITTED';

    if (!wedding_date && status === 'SUBMITTED') {
      return res.status(400).json({
        success: false,
        message: 'Proposed wedding date is required.'
      });
    }

    // Get customer_id for logged in user
    const [cRows] = await query('SELECT id, planner_id FROM customers WHERE user_id = ?', [req.user.id]);
    if (cRows.length === 0) {
      return res.status(403).json({ success: false, message: 'Only registered customers can submit requirements.' });
    }
    const customer = cRows[0];

    // Format services as JSON string if passed as array
    const servicesJson = typeof required_services === 'string' ? required_services : JSON.stringify(required_services);

    const [result] = await query(
      `INSERT INTO wedding_requirements (customer_id, wedding_date, location, guest_count, estimated_budget, required_services, special_preferences, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [customer.id, wedding_date || new Date().toISOString().split('T')[0], location, guest_count, parseFloat(estimated_budget), servicesJson, special_preferences, status]
    );

    const requirementId = result.insertId;

    // Update customer record
    if (wedding_date) {
      await query(
        `UPDATE customers SET wedding_date = ?, estimated_budget = ?, guest_count = ?, city = COALESCE(?, city) WHERE id = ?`,
        [wedding_date, parseFloat(estimated_budget), guest_count, location, customer.id]
      );
    }

    if (status === 'SUBMITTED') {
      // Notify assigned Planner
      const [planners] = await query('SELECT user_id FROM planners WHERE id = ?', [customer.planner_id || 1]);
      const plannerUserId = planners.length > 0 ? planners[0].user_id : 1;

      await createNotification({
        userId: plannerUserId,
        title: 'New Wedding Requirements Submitted',
        message: `${req.user.full_name} submitted wedding requirements for ${wedding_date || 'ceremony'} in ${location}.`,
        notificationType: 'SYSTEM',
        referenceId: requirementId,
        referenceType: 'requirement'
      });
    }

    return res.status(201).json({
      success: true,
      message: status === 'DRAFT' 
        ? 'Wedding requirements saved as draft successfully. You can review and send to your planner anytime.' 
        : 'Wedding requirements submitted to your planner successfully! Quotes and proposals will be curated.',
      requirement_id: requirementId,
      status
    });

  } catch (error) {
    console.error('[submitRequirements Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit requirements.' });
  }
}

// Update existing requirements (Save draft changes)
async function updateRequirement(req, res) {
  try {
    const { id } = req.params;
    const wedding_date = req.body.wedding_date || req.body.event_date;
    const location = req.body.location || req.body.city;
    const guest_count = req.body.guest_count;
    const estimated_budget = req.body.estimated_budget || req.body.budget_max || req.body.budget_min;
    const required_services = req.body.required_services || req.body.ceremony_types;
    const special_preferences = req.body.special_preferences || req.body.notes || req.body.theme_preferences;
    const status = req.body.status || 'DRAFT';

    const [cRows] = await query('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
    if (cRows.length === 0) return res.status(403).json({ success: false, message: 'Customer record not found.' });

    const servicesJson = required_services 
      ? (typeof required_services === 'string' ? required_services : JSON.stringify(required_services)) 
      : null;

    await query(
      `UPDATE wedding_requirements SET
         wedding_date = COALESCE(?, wedding_date),
         location = COALESCE(?, location),
         guest_count = COALESCE(?, guest_count),
         estimated_budget = COALESCE(?, estimated_budget),
         required_services = COALESCE(?, required_services),
         special_preferences = COALESCE(?, special_preferences),
         status = ?
       WHERE id = ? AND customer_id = ?`,
      [wedding_date, location, guest_count, estimated_budget ? parseFloat(estimated_budget) : null, servicesJson, special_preferences, status, id, cRows[0].id]
    );

    return res.json({
      success: true,
      message: 'Wedding requirements updated and saved successfully.'
    });
  } catch (error) {
    console.error('[updateRequirement Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update requirement.' });
  }
}

// Send Requirement to Wedding Planner
async function sendRequirementToPlanner(req, res) {
  try {
    const { id } = req.params;
    const [cRows] = await query('SELECT id, planner_id FROM customers WHERE user_id = ?', [req.user.id]);
    if (cRows.length === 0) return res.status(403).json({ success: false, message: 'Customer record not found.' });

    const customer = cRows[0];
    const [reqRows] = await query('SELECT * FROM wedding_requirements WHERE id = ? AND customer_id = ?', [id, customer.id]);
    if (reqRows.length === 0) return res.status(404).json({ success: false, message: 'Requirement record not found.' });

    await query(`UPDATE wedding_requirements SET status = 'SUBMITTED' WHERE id = ?`, [id]);

    // Notify Planner
    const [planners] = await query('SELECT user_id FROM planners WHERE id = ?', [customer.planner_id || 1]);
    const plannerUserId = planners.length > 0 ? planners[0].user_id : 1;

    await createNotification({
      userId: plannerUserId,
      title: 'Customer Dispatched Wedding Requirements',
      message: `${req.user.full_name} sent finalized wedding requirements for evaluation and vendor arrangement.`,
      notificationType: 'SYSTEM',
      referenceId: id,
      referenceType: 'requirement'
    });

    return res.json({
      success: true,
      message: 'Requirements successfully sent to your wedding planner! They will review and formulate your vendor arrangement proposal.'
    });
  } catch (error) {
    console.error('[sendRequirementToPlanner Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to send requirements to planner.' });
  }
}

// Get customer's own requirements
async function getMyRequirements(req, res) {
  try {
    const [cRows] = await query('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
    if (cRows.length === 0) return res.status(404).json({ success: false, message: 'Customer record not found.' });

    const [rows] = await query(
      `SELECT wr.*, wp.project_code, wp.title AS project_title, wp.status AS project_status
       FROM wedding_requirements wr
       LEFT JOIN wedding_projects wp ON wr.wedding_project_id = wp.id
       WHERE wr.customer_id = ?
       ORDER BY wr.created_at DESC`,
      [cRows[0].id]
    );

    // Parse required_services JSON if needed
    const parsed = rows.map(r => ({
      ...r,
      required_services: typeof r.required_services === 'string' ? JSON.parse(r.required_services) : r.required_services
    }));

    return res.json({ success: true, data: parsed });
  } catch (error) {
    console.error('[getMyRequirements Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch requirements.' });
  }
}

// Planner: Get all customer requirements
async function getAllRequirements(req, res) {
  try {
    const { status, search, sort_by } = req.query;
    const { page, limit, offset, isExplicit } = parsePagination(req.query, 10, 100);

    let baseFromWhere = `
      FROM wedding_requirements wr
      JOIN customers c ON wr.customer_id = c.id
      JOIN users u ON c.user_id = u.id
      LEFT JOIN planners p ON c.planner_id = p.id
      LEFT JOIN wedding_projects wp ON wr.wedding_project_id = wp.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      baseFromWhere += ` AND wr.status = ?`;
      params.push(status);
    }

    if (search) {
      baseFromWhere += ` AND (u.full_name LIKE ? OR c.partner_name LIKE ? OR wr.location LIKE ? OR wp.title LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    // 1. Total count
    const [countRows] = await query(`SELECT COUNT(*) AS total ${baseFromWhere}`, params);
    const totalCount = countRows[0]?.total || 0;

    // 2. Sorting
    const sortMap = {
      newest: 'wr.created_at DESC',
      date_asc: 'wr.wedding_date ASC',
      date_desc: 'wr.wedding_date DESC',
      budget_desc: 'wr.estimated_budget DESC',
      budget_asc: 'wr.estimated_budget ASC',
      name_asc: 'u.full_name ASC'
    };
    const orderClause = buildOrderBy(sort_by, sortMap, 'wr.created_at DESC');

    // 3. Selection query
    let selectSql = `
      SELECT wr.*, c.partner_name, u.full_name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
             p.agency_name AS planner_agency,
             wp.project_code, wp.title AS project_title
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

    const parsed = rows.map(r => ({
      ...r,
      required_services: typeof r.required_services === 'string' ? JSON.parse(r.required_services) : r.required_services
    }));

    return res.json(buildPaginationResponse(parsed, totalCount, page, isExplicit ? limit : (parsed.length || 1)));
  } catch (error) {
    console.error('[getAllRequirements Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve requirements.' });
  }
}

// Planner: Convert requirements to Wedding Project
async function convertRequirementToProject(req, res) {
  try {
    const { id } = req.params;
    const { title, venue_name, venue_address, city, total_budget } = req.body;

    const [reqRows] = await query('SELECT * FROM wedding_requirements WHERE id = ?', [id]);
    if (reqRows.length === 0) return res.status(404).json({ success: false, message: 'Requirement not found.' });

    const requirement = reqRows[0];
    const plannerId = req.user.planner_id || 1;

    // Generate project code
    const projectCode = `WP-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900))}`;
    const budget = total_budget ? parseFloat(total_budget) : parseFloat(requirement.estimated_budget);

    // Create Wedding Project
    const [projectResult] = await query(
      `INSERT INTO wedding_projects (project_code, customer_id, planner_id, title, wedding_date, venue_name, venue_address, city, guest_count, total_budget, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PLANNING', ?)`,
      [
        projectCode,
        requirement.customer_id,
        plannerId,
        title || `Wedding of Customer #${requirement.customer_id}`,
        requirement.wedding_date,
        venue_name || 'To Be Confirmed',
        venue_address || requirement.location,
        city || requirement.location,
        requirement.guest_count,
        budget,
        requirement.special_preferences
      ]
    );

    const projectId = projectResult.insertId;

    // Link requirement to project & mark status
    await query(
      `UPDATE wedding_requirements SET wedding_project_id = ?, status = 'CONVERTED_TO_PROJECT' WHERE id = ?`,
      [projectId, id]
    );

    // Initialize Budget record
    await query(
      `INSERT INTO budgets (wedding_project_id, total_budget, allocated_amount, spent_amount, remaining_amount)
       VALUES (?, ?, 0.00, 0.00, ?)`,
      [projectId, budget, budget]
    );

    // Initialize Draft Booking record
    const bookingCode = `BK-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900))}`;
    await query(
      `INSERT INTO bookings (booking_code, wedding_project_id, customer_id, planner_id, total_amount, advance_amount, paid_amount, status)
       VALUES (?, ?, ?, ?, 0.00, 0.00, 0.00, 'DRAFT')`,
      [bookingCode, projectId, requirement.customer_id, plannerId]
    );

    // Notify Customer
    const [custUser] = await query('SELECT user_id FROM customers WHERE id = ?', [requirement.customer_id]);
    if (custUser.length > 0) {
      await createNotification({
        userId: custUser[0].user_id,
        title: 'Wedding Project Created!',
        message: `Your wedding planner has created project "${title || projectCode}". Vendors are now being curated for your special day.`,
        notificationType: 'SYSTEM',
        referenceId: projectId,
        referenceType: 'wedding_project'
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Requirements converted to Wedding Project successfully.',
      project_id: projectId,
      project_code: projectCode
    });

  } catch (error) {
    console.error('[convertRequirementToProject Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to convert requirement to project.' });
  }
}

// Planner: Decline wedding requirements
async function declineRequirement(req, res) {
  try {
    const { id } = req.params;
    const { decline_reason } = req.body;

    const [reqRows] = await query(
      `SELECT wr.*, c.user_id AS customer_user_id, u.full_name AS customer_name
       FROM wedding_requirements wr
       JOIN customers c ON wr.customer_id = c.id
       JOIN users u ON c.user_id = u.id
       WHERE wr.id = ?`,
      [id]
    );

    if (reqRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Requirement not found.' });
    }

    const requirement = reqRows[0];
    if (requirement.status === 'CONVERTED_TO_PROJECT') {
      return res.status(400).json({ success: false, message: 'Cannot decline a requirement that has already been converted to an active project.' });
    }

    const note = decline_reason && decline_reason.trim() !== '' ? ` [Declined Note: ${decline_reason.trim()}]` : '';

    await query(
      `UPDATE wedding_requirements 
       SET status = 'REJECTED', 
           special_preferences = CONCAT(COALESCE(special_preferences, ''), ?)
       WHERE id = ?`,
      [note, id]
    );

    // Notify Customer
    await createNotification({
      userId: requirement.customer_user_id,
      title: 'Wedding Request Status Update',
      message: `Your wedding requirements request for ${requirement.wedding_date} has been reviewed and declined.${decline_reason ? ` Note: "${decline_reason.trim()}"` : ''}`,
      notificationType: 'SYSTEM',
      referenceId: id,
      referenceType: 'requirement'
    });

    return res.json({
      success: true,
      message: 'Wedding requirements request declined. Customer has been notified.'
    });
  } catch (error) {
    console.error('[declineRequirement Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to decline requirement.' });
  }
}

module.exports = {
  submitRequirements,
  updateRequirement,
  sendRequirementToPlanner,
  getMyRequirements,
  getAllRequirements,
  convertRequirementToProject,
  declineRequirement
};
