const { pool, query } = require('../config/db');

async function migrateVerificationWorkflow() {
  console.log('[Migration] Adding Re-Verification columns to tables...');
  try {
    // 1. wedding_requirements
    const [reqCols] = await query("SHOW COLUMNS FROM wedding_requirements LIKE 'verification_status'");
    if (reqCols.length === 0) {
      await query(`
        ALTER TABLE wedding_requirements
        ADD COLUMN verification_status ENUM('VERIFIED', 'PENDING_PLANNER_VERIFICATION') NOT NULL DEFAULT 'VERIFIED',
        ADD COLUMN last_edited_by ENUM('CUSTOMER', 'PLANNER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
        ADD COLUMN change_summary TEXT NULL;
      `);
      console.log('✓ Added verification columns to wedding_requirements.');
    } else {
      console.log('✓ wedding_requirements already has verification columns.');
    }

    // 2. wedding_projects
    const [projCols] = await query("SHOW COLUMNS FROM wedding_projects LIKE 'verification_status'");
    if (projCols.length === 0) {
      await query(`
        ALTER TABLE wedding_projects
        ADD COLUMN verification_status ENUM('VERIFIED', 'PENDING_CUSTOMER_VERIFICATION', 'PENDING_PLANNER_VERIFICATION') NOT NULL DEFAULT 'VERIFIED',
        ADD COLUMN last_edited_by ENUM('CUSTOMER', 'PLANNER', 'ADMIN') NOT NULL DEFAULT 'PLANNER',
        ADD COLUMN change_summary TEXT NULL;
      `);
      console.log('✓ Added verification columns to wedding_projects.');
    } else {
      console.log('✓ wedding_projects already has verification columns.');
    }

    // 3. vendor_services
    const [servCols] = await query("SHOW COLUMNS FROM vendor_services LIKE 'verification_status'");
    if (servCols.length === 0) {
      await query(`
        ALTER TABLE vendor_services
        ADD COLUMN verification_status ENUM('VERIFIED', 'PENDING_PLANNER_VERIFICATION') NOT NULL DEFAULT 'VERIFIED',
        ADD COLUMN change_summary TEXT NULL;
      `);
      console.log('✓ Added verification columns to vendor_services.');
    } else {
      console.log('✓ vendor_services already has verification columns.');
    }

    // 4. wedding_schedule
    const [schedCols] = await query("SHOW COLUMNS FROM wedding_schedule LIKE 'verification_status'");
    if (schedCols.length === 0) {
      await query(`
        ALTER TABLE wedding_schedule
        ADD COLUMN verification_status ENUM('VERIFIED', 'PENDING_VERIFICATION') NOT NULL DEFAULT 'VERIFIED',
        ADD COLUMN last_edited_by ENUM('CUSTOMER', 'PLANNER', 'ADMIN') NOT NULL DEFAULT 'PLANNER';
      `);
      console.log('✓ Added verification columns to wedding_schedule.');
    } else {
      console.log('✓ wedding_schedule already has verification columns.');
    }

    console.log('[Migration] All Re-Verification columns successfully applied!');
  } catch (err) {
    console.error('[Migration Error]:', err);
  } finally {
    await pool.end();
  }
}

migrateVerificationWorkflow();
