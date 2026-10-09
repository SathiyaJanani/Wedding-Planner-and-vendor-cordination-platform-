const { query } = require('../config/db');

// Get notifications for current user
async function getNotifications(req, res) {
  try {
    const userId = req.user.id;
    const { is_read } = req.query;

    let sql = `SELECT * FROM notifications WHERE user_id = ?`;
    const params = [userId];

    if (is_read !== undefined) {
      sql += ` AND is_read = ?`;
      params.push(is_read === 'true' || is_read === '1');
    }

    sql += ` ORDER BY created_at DESC LIMIT 50`;

    const [rows] = await query(sql, params);
    const [unread] = await query('SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = FALSE', [userId]);

    return res.json({
      success: true,
      count: rows.length,
      unread_count: unread[0].count,
      data: rows
    });

  } catch (error) {
    console.error('[getNotifications Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve notifications.' });
  }
}

// Mark single notification as read
async function markNotificationRead(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await query('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [id, userId]);
    return res.json({ success: true, message: 'Notification marked as read.' });

  } catch (error) {
    console.error('[markNotificationRead Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
}

// Mark all notifications as read
async function markAllNotificationsRead(req, res) {
  try {
    const userId = req.user.id;
    await query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [userId]);
    return res.json({ success: true, message: 'All notifications marked as read.' });

  } catch (error) {
    console.error('[markAllNotificationsRead Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update notifications.' });
  }
}

module.exports = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead
};
