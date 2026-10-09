const { query } = require('../config/db');

async function migrate() {
  try {
    await query("ALTER TABLE messages ADD COLUMN message_type VARCHAR(20) DEFAULT 'TEXT'");
    console.log('[OK] Added column message_type to messages table');
  } catch (e) {
    if (e.message.includes('Duplicate column name')) {
      console.log('[INFO] Column message_type already exists');
    } else {
      console.error('[ERROR] message_type:', e.message);
    }
  }

  try {
    await query("ALTER TABLE messages ADD COLUMN media_url VARCHAR(500) DEFAULT NULL");
    console.log('[OK] Added column media_url to messages table');
  } catch (e) {
    if (e.message.includes('Duplicate column name')) {
      console.log('[INFO] Column media_url already exists');
    } else {
      console.error('[ERROR] media_url:', e.message);
    }
  }

  try {
    await query("ALTER TABLE messages ADD COLUMN duration INT DEFAULT 0");
    console.log('[OK] Added column duration to messages table');
  } catch (e) {
    if (e.message.includes('Duplicate column name')) {
      console.log('[INFO] Column duration already exists');
    } else {
      console.error('[ERROR] duration:', e.message);
    }
  }

  try {
    await query("ALTER TABLE notifications MODIFY COLUMN notification_type VARCHAR(50) DEFAULT 'SYSTEM'");
    console.log('[OK] Modified notifications.notification_type to VARCHAR(50)');
  } catch (e) {
    console.warn('[WARN] notifications.notification_type:', e.message);
  }

  const [cols] = await query("DESCRIBE messages");
  console.log('Current messages columns:', cols.map(c => c.Field));
  process.exit(0);
}

migrate();
