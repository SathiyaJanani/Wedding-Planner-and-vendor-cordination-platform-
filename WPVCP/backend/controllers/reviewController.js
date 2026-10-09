const { query } = require('../config/db');
const { createNotification } = require('../services/notificationService');

// Submit review (Customer)
async function submitReview(req, res) {
  try {
    const { wedding_project_id, booking_id, vendor_id, planner_id, rating, review_text } = req.body;

    if (!rating || !review_text) {
      return res.status(400).json({ success: false, message: 'Rating (1-5) and review text are required.' });
    }

    const [cRows] = await query('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
    if (cRows.length === 0) return res.status(403).json({ success: false, message: 'Only customers can submit reviews.' });

    const customerId = cRows[0].id;

    const [result] = await query(
      `INSERT INTO reviews (wedding_project_id, booking_id, customer_id, vendor_id, planner_id, rating, review_text)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [wedding_project_id || null, booking_id || null, customerId, vendor_id || null, planner_id || null, parseInt(rating, 10), review_text.trim()]
    );

    // If review is for a vendor, update vendor average rating & total reviews
    if (vendor_id) {
      const [agg] = await query(
        `SELECT AVG(rating) AS avg_rating, COUNT(*) AS count FROM reviews WHERE vendor_id = ?`,
        [vendor_id]
      );
      if (agg.length > 0) {
        await query(
          `UPDATE vendors SET rating = ?, total_reviews = ? WHERE id = ?`,
          [parseFloat(agg[0].avg_rating).toFixed(2), agg[0].count, vendor_id]
        );
      }

      // Notify vendor
      const [vUsers] = await query('SELECT user_id FROM vendors WHERE id = ?', [vendor_id]);
      if (vUsers.length > 0) {
        await createNotification({
          userId: vUsers[0].user_id,
          title: 'New Customer Review Received!',
          message: `${req.user.full_name} gave you a ${rating}-star rating: "${review_text.trim().substring(0, 80)}..."`,
          notificationType: 'SYSTEM',
          referenceId: result.insertId,
          referenceType: 'review'
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully. Thank you for your feedback!',
      review_id: result.insertId
    });

  } catch (error) {
    console.error('[submitReview Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
}

// Get reviews (filter by vendor_id, customer_id, or all)
async function getReviews(req, res) {
  try {
    const { vendor_id, planner_id } = req.query;

    let sql = `
      SELECT r.*,
             u.full_name AS customer_name, u.avatar_url AS customer_avatar,
             v.business_name AS vendor_name,
             p.agency_name AS planner_agency,
             wp.title AS project_title
      FROM reviews r
      JOIN customers c ON r.customer_id = c.id
      JOIN users u ON c.user_id = u.id
      LEFT JOIN vendors v ON r.vendor_id = v.id
      LEFT JOIN planners p ON r.planner_id = p.id
      LEFT JOIN wedding_projects wp ON r.wedding_project_id = wp.id
      WHERE 1=1
    `;
    const params = [];

    // If logged-in user is a vendor, show their reviews (ensuring at least 6 reviews displayed)
    if (req.user.role_name === 'VENDOR' && req.user.vendor_id) {
      let [vRows] = await query(sql + ` AND r.vendor_id = ? ORDER BY r.created_at DESC`, [req.user.vendor_id]);
      if (vRows.length < 6) {
        const [allReviews] = await query(sql + ` ORDER BY r.created_at DESC LIMIT 10`, []);
        const existingIds = new Set(vRows.map(r => r.id));
        for (const rev of allReviews) {
          if (!existingIds.has(rev.id) && vRows.length < 6) {
            vRows.push(rev);
          }
        }
      }
      return res.json({ success: true, count: vRows.length, data: vRows });
    } else if (vendor_id) {
      sql += ` AND r.vendor_id = ?`;
      params.push(vendor_id);
    }

    if (planner_id) {
      sql += ` AND r.planner_id = ?`;
      params.push(planner_id);
    }

    sql += ` ORDER BY r.created_at DESC`;

    const [rows] = await query(sql, params);
    return res.json({ success: true, count: rows.length, data: rows });

  } catch (error) {
    console.error('[getReviews Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve reviews.' });
  }
}

// Vendor response to review
async function respondToReview(req, res) {
  try {
    const { id } = req.params;
    const { response_text } = req.body;

    if (!response_text || response_text.trim() === '') {
      return res.status(400).json({ success: false, message: 'Response text cannot be empty.' });
    }

    await query('UPDATE reviews SET response_text = ? WHERE id = ?', [response_text.trim(), id]);
    return res.json({ success: true, message: 'Response added to review successfully.' });

  } catch (error) {
    console.error('[respondToReview Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to respond to review.' });
  }
}

module.exports = {
  submitReview,
  getReviews,
  respondToReview
};
