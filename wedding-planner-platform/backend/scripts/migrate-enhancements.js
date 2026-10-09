const { pool } = require('../config/db');

async function migrate() {
  try {
    // 1. booking_services.paid_amount
    const [cols1] = await pool.query("SHOW COLUMNS FROM booking_services LIKE 'paid_amount'");
    if (cols1.length === 0) {
      await pool.query("ALTER TABLE booking_services ADD COLUMN paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00 AFTER agreed_price");
      console.log('Added paid_amount to booking_services');
    }

    // 2. payments.booking_service_id
    const [cols2] = await pool.query("SHOW COLUMNS FROM payments LIKE 'booking_service_id'");
    if (cols2.length === 0) {
      await pool.query("ALTER TABLE payments ADD COLUMN booking_service_id INT NULL AFTER booking_id");
      console.log('Added booking_service_id to payments');
    }

    // 3. support_requests: booking_id, assigned_to, resolved_at
    const [cols3] = await pool.query("SHOW COLUMNS FROM support_requests LIKE 'booking_id'");
    if (cols3.length === 0) {
      await pool.query("ALTER TABLE support_requests ADD COLUMN booking_id INT NULL AFTER user_id");
      console.log('Added booking_id to support_requests');
    }
    const [cols4] = await pool.query("SHOW COLUMNS FROM support_requests LIKE 'assigned_to'");
    if (cols4.length === 0) {
      await pool.query("ALTER TABLE support_requests ADD COLUMN assigned_to INT NULL AFTER status");
      console.log('Added assigned_to to support_requests');
    }
    const [cols5] = await pool.query("SHOW COLUMNS FROM support_requests LIKE 'resolved_at'");
    if (cols5.length === 0) {
      await pool.query("ALTER TABLE support_requests ADD COLUMN resolved_at TIMESTAMP NULL AFTER resolution_notes");
      console.log('Added resolved_at to support_requests');
    }

    // 4. Also calculate initial booking_services.paid_amount for existing bookings if any
    const [bookings] = await pool.query("SELECT id, total_amount, paid_amount FROM bookings WHERE paid_amount > 0");
    for (const b of bookings) {
      const [services] = await pool.query("SELECT id, agreed_price FROM booking_services WHERE booking_id = ?", [b.id]);
      if (services.length > 0 && b.total_amount > 0) {
        const ratio = Math.min(1, parseFloat(b.paid_amount) / parseFloat(b.total_amount));
        for (const s of services) {
          const sPaid = Math.round(parseFloat(s.agreed_price) * ratio * 100) / 100;
          await pool.query("UPDATE booking_services SET paid_amount = ? WHERE id = ?", [sPaid, s.id]);
        }
      }
    }

    // 5. Update schema.sql as well so fresh setups have these columns
    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err.message);
    process.exit(1);
  }
}

migrate();
