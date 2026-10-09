const { query } = require('../config/db');

// Get wishlist items for logged in customer
async function getWishlist(req, res) {
  try {
    const [cRows] = await query('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
    if (cRows.length === 0) return res.status(403).json({ success: false, message: 'Customer record not found.' });

    const customerId = cRows[0].id;

    const [rows] = await query(
      `SELECT w.*,
              v.business_name, v.city AS vendor_city, v.rating AS vendor_rating, v.base_price, v.price_range,
              sc.name AS category_name, sc.slug AS category_slug, sc.icon AS category_icon,
              vs.name AS service_name, vs.price AS service_price
       FROM wishlists w
       LEFT JOIN vendors v ON w.vendor_id = v.id
       LEFT JOIN service_categories sc ON v.category_id = sc.id
       LEFT JOIN vendor_services vs ON w.service_id = vs.id
       WHERE w.customer_id = ?
       ORDER BY w.created_at DESC`,
      [customerId]
    );

    return res.json({ success: true, count: rows.length, data: rows });

  } catch (error) {
    console.error('[getWishlist Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve wishlist.' });
  }
}

// Add item to wishlist
async function addToWishlist(req, res) {
  try {
    const { vendor_id, service_id, notes } = req.body;

    const [cRows] = await query('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
    if (cRows.length === 0) return res.status(403).json({ success: false, message: 'Customer record not found.' });

    const customerId = cRows[0].id;

    // Check if already in wishlist
    const [existing] = await query(
      'SELECT id FROM wishlists WHERE customer_id = ? AND vendor_id = ?',
      [customerId, vendor_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'This vendor is already in your wishlist.' });
    }

    const [result] = await query(
      `INSERT INTO wishlists (customer_id, vendor_id, service_id, notes) VALUES (?, ?, ?, ?)`,
      [customerId, vendor_id || null, service_id || null, notes || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Item saved to wishlist.',
      wishlist_id: result.insertId
    });

  } catch (error) {
    console.error('[addToWishlist Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to add item to wishlist.' });
  }
}

// Remove from wishlist
async function removeFromWishlist(req, res) {
  try {
    const { id } = req.params;
    const [cRows] = await query('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
    if (cRows.length === 0) return res.status(403).json({ success: false, message: 'Customer record not found.' });

    await query('DELETE FROM wishlists WHERE id = ? AND customer_id = ?', [id, cRows[0].id]);
    return res.json({ success: true, message: 'Item removed from wishlist.' });

  } catch (error) {
    console.error('[removeFromWishlist Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to remove item.' });
  }
}

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};
