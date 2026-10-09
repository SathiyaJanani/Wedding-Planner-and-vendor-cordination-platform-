const { query } = require('../config/db');
const { createNotification } = require('../services/notificationService');

// Get conversations for current user
async function getConversations(req, res) {
  try {
    const userId = req.user.id;

    const [rows] = await query(
      `SELECT c.*,
              u1.full_name AS user1_name, u1.email AS user1_email, u1.avatar_url AS user1_avatar, r1.name AS user1_role,
              u2.full_name AS user2_name, u2.email AS user2_email, u2.avatar_url AS user2_avatar, r2.name AS user2_role,
              wp.title AS project_title,
              (SELECT message_text FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message_text,
              (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message_time,
              (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND recipient_id = ? AND is_read = FALSE) AS unread_count
       FROM conversations c
       JOIN users u1 ON c.participant_one_id = u1.id
       JOIN roles r1 ON u1.role_id = r1.id
       JOIN users u2 ON c.participant_two_id = u2.id
       JOIN roles r2 ON u2.role_id = r2.id
       LEFT JOIN wedding_projects wp ON c.wedding_project_id = wp.id
       WHERE c.participant_one_id = ? OR c.participant_two_id = ?
       ORDER BY c.last_message_at DESC`,
      [userId, userId, userId]
    );

    // Normalize other participant info
    const conversations = rows.map(c => {
      const isUser1 = c.participant_one_id === userId;
      return {
        id: c.id,
        wedding_project_id: c.wedding_project_id,
        project_title: c.project_title,
        other_user: {
          id: isUser1 ? c.participant_two_id : c.participant_one_id,
          name: isUser1 ? c.user2_name : c.user1_name,
          email: isUser1 ? c.user2_email : c.user1_email,
          avatar: isUser1 ? c.user2_avatar : c.user1_avatar,
          role: isUser1 ? c.user2_role : c.user1_role
        },
        last_message_text: c.last_message_text,
        last_message_at: c.last_message_time || c.last_message_at,
        unread_count: c.unread_count
      };
    });

    return res.json({ success: true, count: conversations.length, data: conversations });

  } catch (error) {
    console.error('[getConversations Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve conversations.' });
  }
}

// Get messages for a specific conversation
async function getMessages(req, res) {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Check participation
    const [cRows] = await query(
      `SELECT * FROM conversations WHERE id = ? AND (participant_one_id = ? OR participant_two_id = ?)`,
      [conversationId, userId, userId]
    );

    if (cRows.length === 0) {
      return res.status(403).json({ success: false, message: 'Forbidden. You are not a participant in this conversation.' });
    }

    const [rows] = await query(
      `SELECT m.*, u.full_name AS sender_name, u.avatar_url AS sender_avatar
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = ?
       ORDER BY m.created_at ASC`,
      [conversationId]
    );

    // Mark unread messages as read
    await query(
      `UPDATE messages SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
       WHERE conversation_id = ? AND recipient_id = ? AND is_read = FALSE`,
      [conversationId, userId]
    );

    return res.json({ success: true, count: rows.length, data: rows });

  } catch (error) {
    console.error('[getMessages Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve messages.' });
  }
}

// Send a message
async function sendMessage(req, res) {
  try {
    const { conversation_id, recipient_id, message_text, wedding_project_id } = req.body;
    const senderId = req.user.id;

    if (!message_text || message_text.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message content cannot be empty.' });
    }

    let activeConvId = conversation_id;

    // If conversation doesn't exist yet, create or find one
    if (!activeConvId && recipient_id) {
      const [existing] = await query(
        `SELECT id FROM conversations 
         WHERE (participant_one_id = ? AND participant_two_id = ?)
            OR (participant_one_id = ? AND participant_two_id = ?)`,
        [senderId, recipient_id, recipient_id, senderId]
      );

      if (existing.length > 0) {
        activeConvId = existing[0].id;
      } else {
        const [cResult] = await query(
          `INSERT INTO conversations (wedding_project_id, participant_one_id, participant_two_id, last_message_at)
           VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
          [wedding_project_id || null, senderId, recipient_id]
        );
        activeConvId = cResult.insertId;
      }
    }

    if (!activeConvId) {
      return res.status(400).json({ success: false, message: 'Conversation ID or recipient ID is required.' });
    }

    // Determine recipient if not provided
    let targetRecipientId = recipient_id;
    if (!targetRecipientId) {
      const [cData] = await query('SELECT participant_one_id, participant_two_id FROM conversations WHERE id = ?', [activeConvId]);
      if (cData.length > 0) {
        targetRecipientId = cData[0].participant_one_id === senderId ? cData[0].participant_two_id : cData[0].participant_one_id;
      }
    }

    // Insert message
    const [msgResult] = await query(
      `INSERT INTO messages (conversation_id, sender_id, recipient_id, message_text, is_read)
       VALUES (?, ?, ?, ?, FALSE)`,
      [activeConvId, senderId, targetRecipientId, message_text.trim()]
    );

    // Update conversation last_message_at
    await query('UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?', [activeConvId]);

    // Dispatch notification
    await createNotification({
      userId: targetRecipientId,
      title: `New message from ${req.user.full_name}`,
      message: message_text.trim().substring(0, 100) + (message_text.length > 100 ? '...' : ''),
      notificationType: 'MESSAGE',
      referenceId: activeConvId,
      referenceType: 'conversation'
    });

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully.',
      data: {
        id: msgResult.insertId,
        conversation_id: activeConvId,
        sender_id: senderId,
        recipient_id: targetRecipientId,
        message_text: message_text.trim(),
        created_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[sendMessage Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to send message.' });
  }
}

module.exports = {
  getConversations,
  getMessages,
  sendMessage
};
