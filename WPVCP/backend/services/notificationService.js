const { query } = require('../config/db');

async function createNotification({
  userId,
  title,
  message,
  notificationType = 'SYSTEM',
  referenceId = null,
  referenceType = null
}) {
  try {
    const [result] = await query(
      `INSERT INTO notifications (user_id, title, message, notification_type, reference_id, reference_type, is_read)
       VALUES (?, ?, ?, ?, ?, ?, FALSE)`,
      [userId, title, message, notificationType, referenceId, referenceType]
    );
    return result.insertId;
  } catch (error) {
    console.error('[NotificationService Error]:', error.message);
    return null;
  }
}

module.exports = {
  createNotification
};
