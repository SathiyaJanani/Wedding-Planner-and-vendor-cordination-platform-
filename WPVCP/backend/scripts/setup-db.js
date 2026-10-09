const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'wedding_planner';

async function setupDatabase() {
  console.log('=====================================================================');
  console.log(' Wedding Planner & Vendor Coordination Platform - Database Setup');
  console.log('=====================================================================');
  console.log(`Connecting to MySQL at ${DB_HOST}:${DB_PORT} as user "${DB_USER}"...`);

  let connection;
  try {
    // 1. Connect without selecting database to ensure database can be created
    connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      multipleStatements: true
    });

    console.log('[1/4] Connected to MySQL server.');

    // 2. Create database if it does not exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`[2/4] Database "${DB_NAME}" created / verified.`);

    // 3. Switch to database and execute schema.sql
    await connection.changeUser({ database: DB_NAME });

    const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      console.log('[3/4] Applying schema.sql (creating 28 tables)...');
      await connection.query(schemaSql);
      console.log('      Schema tables created successfully.');
    } else {
      console.error(`Schema file not found at: ${schemaPath}`);
    }

    // 4. Execute seed.sql
    const seedPath = path.resolve(__dirname, '../../database/seed.sql');
    if (fs.existsSync(seedPath)) {
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      console.log('[4/4] Applying seed.sql (inserting sample users, vendors, projects)...');
      await connection.query(seedSql);
      console.log('      Sample seed data inserted successfully.');
    } else {
      console.error(`Seed file not found at: ${seedPath}`);
    }

    // Verification check
    const [tables] = await connection.query('SHOW TABLES;');
    console.log('=====================================================================');
    console.log(`DATABASE SETUP COMPLETE! Total tables in "${DB_NAME}": ${tables.length}`);
    console.log('Sample Logins (Password for all: password123)');
    console.log('  - PLANNER:  planner@wedding.com');
    console.log('  - VENDOR:   shutter@wedding.com, floral@wedding.com, royalcatering@wedding.com');
    console.log('  - CUSTOMER: rahul.anita@gmail.com, rohit.sneha@gmail.com');
    console.log('=====================================================================');

  } catch (error) {
    console.error('\n[DATABASE SETUP ERROR]:', error.message);
    console.error('\nTroubleshooting suggestions:');
    console.error('1. Check if MySQL service is running (e.g. MySQL80 in Windows Services).');
    console.error('2. Verify your DB_PASSWORD in backend/.env.');
    console.error('3. Make sure user has permissions to CREATE DATABASE.\n');
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

setupDatabase();
