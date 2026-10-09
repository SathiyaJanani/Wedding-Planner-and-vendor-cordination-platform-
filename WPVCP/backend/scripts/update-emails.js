const { query } = require('../config/db');

async function updateEmails() {
  try {
    console.log('--- Updating user emails to real addresses ---');

    // 1. Release sathiyajani email if held by user 1
    await query("UPDATE users SET email = 'archive_admin@weddingplanner.com' WHERE id = 1");

    // 2. Update Planner user 6 to sathiyajani1112@gmail.com
    await query("UPDATE users SET email = 'sathiyajani1112@gmail.com' WHERE id = 6");

    // 3. Update all vendors (role_id 3) to @vendor.com
    await query("UPDATE users SET email = REPLACE(email, '@wedding.com', '@vendor.com') WHERE role_id = 3");

    // 4. Verify results
    const [planner] = await query("SELECT id, email, full_name, role_id FROM users WHERE id = 6");
    console.log('Updated Planner:', planner[0]);

    const [vendors] = await query("SELECT id, email, full_name FROM users WHERE role_id = 3 LIMIT 10");
    console.log('Updated Vendors sample (10 of 45):', vendors);

    const [allVendorsCount] = await query("SELECT COUNT(*) as count FROM users WHERE role_id = 3 AND email LIKE '%@vendor.com'");
    console.log('Total Vendors with @vendor.com:', allVendorsCount[0].count);

    const [customers] = await query("SELECT id, email, full_name FROM users WHERE role_id = 4");
    console.log('Customers:', customers);

    console.log('--- Successfully updated all accounts! ---');
    process.exit(0);
  } catch (error) {
    console.error('Error updating emails:', error);
    process.exit(1);
  }
}

updateEmails();
