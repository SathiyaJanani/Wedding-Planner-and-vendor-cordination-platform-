const mysql = require('mysql2/promise');
require('dotenv').config({ path: './.env' });
(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  await conn.query(`ALTER TABLE wedding_requirements MODIFY COLUMN status ENUM('DRAFT','SUBMITTED','RESENT','UNDER_REVIEW','CONVERTED_TO_PROJECT','REJECTED') NOT NULL DEFAULT 'DRAFT'`);
  await conn.query(`ALTER TABLE wedding_requirements MODIFY COLUMN verification_status ENUM('VERIFIED','PENDING_PLANNER_VERIFICATION','RESENT','DECLINED','DRAFT') NOT NULL DEFAULT 'VERIFIED'`);
  console.log('ENUMs altered successfully!');
  await conn.end();
})();
