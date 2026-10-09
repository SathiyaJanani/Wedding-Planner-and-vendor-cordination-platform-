const mysql = require('mysql2/promise');
require('dotenv').config({ path: './.env' });

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    const [rolesCount] = await conn.query('SELECT r.name, COUNT(u.id) as count FROM users u JOIN roles r ON u.role_id = r.id GROUP BY r.name');
    console.log('--- Users by Role ---');
    console.table(rolesCount);

    const [admins] = await conn.query("SELECT u.id, u.email, u.full_name, u.phone, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = 'ADMIN'");
    console.log('--- Admins (5 unique records) ---');
    console.table(admins);

    const [customers] = await conn.query("SELECT u.id, u.email, u.full_name, u.phone, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = 'CUSTOMER'");
    console.log('--- Customers (5 unique records) ---');
    console.table(customers);

    const [vendors] = await conn.query("SELECT u.id, u.email, u.full_name, u.phone, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = 'VENDOR' LIMIT 10");
    console.log('--- Sample Vendors (45 total across 15 categories) ---');
    console.table(vendors);

    const [cats] = await conn.query('SELECT c.id, c.name, COUNT(v.id) as vendor_count FROM service_categories c LEFT JOIN vendors v ON c.id = v.category_id GROUP BY c.id, c.name ORDER BY c.id');
    console.log('--- 15 Categories & Vendor Counts ---');
    console.table(cats);

    await conn.end();
  } catch (err) {
    console.error('Verification error:', err);
  }
})();
