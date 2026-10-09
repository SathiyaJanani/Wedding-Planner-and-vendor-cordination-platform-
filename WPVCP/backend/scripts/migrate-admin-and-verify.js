const { pool, query } = require('../config/db');

async function migrateAdmin() {
  try {
    console.log('[Migration] Checking roles table definition...');
    // 1. Alter roles enum to include ADMIN
    await query("ALTER TABLE `roles` MODIFY COLUMN `name` ENUM('ADMIN', 'PLANNER', 'VENDOR', 'CUSTOMER') NOT NULL UNIQUE;");
    console.log('[Migration] Updated roles table enum.');

    // 2. Insert or update ADMIN role
    await query(`
      INSERT INTO \`roles\` (\`id\`, \`name\`, \`description\`)
      VALUES (4, 'ADMIN', 'Executive platform super administrator and system auditor')
      ON DUPLICATE KEY UPDATE \`name\` = 'ADMIN', \`description\` = VALUES(\`description\`);
    `);
    console.log('[Migration] Inserted ADMIN role.');

    // 3. Ensure Admin user exists
    const [adminCheck] = await query("SELECT id FROM users WHERE email = 'admin@wedding.com'");
    if (adminCheck.length === 0) {
      const [adminRole] = await query("SELECT id FROM roles WHERE name = 'ADMIN'");
      const adminRoleId = adminRole[0].id;
      
      await query(`
        INSERT INTO users (email, password_hash, role_id, full_name, phone, auth_provider, email_verified, is_active)
        VALUES ('admin@wedding.com', '$2a$10$N8HuJlfug161k.CXFad/Uu/7Avyyg2xdLYnvwz1UHaXDmuI.STyTi', ?, 'Executive Administrator', '+91 98765 00000', 'local', TRUE, TRUE)
      `, [adminRoleId]);
      console.log('[Migration] Created admin@wedding.com user.');
    } else {
      console.log('[Migration] admin@wedding.com already exists.');
    }

    // 4. Print all current roles and count of users per role
    const [roleCounts] = await query(`
      SELECT r.name AS role_name, COUNT(u.id) AS user_count
      FROM roles r
      LEFT JOIN users u ON u.role_id = r.id
      GROUP BY r.id, r.name
    `);
    console.log('[Migration] User role distribution:', roleCounts);

    console.log('[Migration] Completed successfully.');
  } catch (err) {
    console.error('[Migration Error]:', err);
  } finally {
    await pool.end();
  }
}

migrateAdmin();
