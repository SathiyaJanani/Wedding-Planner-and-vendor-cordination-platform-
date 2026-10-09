const API_BASE = 'http://localhost:5000/api';

async function testLogins() {
  console.log('--- Testing Role-based Login Functionality ---');

  const testAccounts = [
    { email: 'sathiyajani1112@gmail.com', password: 'password123', expectedRole: 'PLANNER', label: 'Planner (sathiyajani1112@gmail.com)' },
    { email: 'planner@planner.com', password: 'password123', expectedRole: 'PLANNER', label: 'Planner (*@planner.com alias)' },
    { email: 'shutter@vendor.com', password: 'password123', expectedRole: 'VENDOR', label: 'Vendor (shutter@vendor.com)' },
    { email: 'grandpalace@vendor.com', password: 'password123', expectedRole: 'VENDOR', label: 'Vendor (grandpalace@vendor.com)' },
    { email: 'floral@vendor.com', password: 'password123', expectedRole: 'VENDOR', label: 'Vendor (floral@vendor.com)' },
    { email: 'barani@gmail.com', password: 'password123', expectedRole: 'CUSTOMER', label: 'Customer (barani@gmail.com)' },
    { email: 'malini@gmail.com', password: 'password123', expectedRole: 'CUSTOMER', label: 'Customer (malini@gmail.com)' },
    { email: 'loha@gmail.com', password: 'password123', expectedRole: 'CUSTOMER', label: 'Customer (loha@gmail.com)' }
  ];

  let allPassed = true;

  for (const acc of testAccounts) {
    try {
      const resp = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: acc.email, password: acc.password })
      });

      const res = await resp.json();
      const user = res.user;
      const roleMatches = user && user.role === acc.expectedRole;
      if (res.success && roleMatches) {
        console.log(`[PASS] ${acc.label} -> Logged in as: ${user.full_name} (${user.email}) | Role: ${user.role}`);
      } else {
        console.error(`[FAIL] ${acc.label} -> Role mismatch! Got: ${user?.role}, expected: ${acc.expectedRole}`);
        allPassed = false;
      }
    } catch (err) {
      console.error(`[FAIL] ${acc.label} -> Request failed:`, err.message);
      allPassed = false;
    }
  }

  if (allPassed) {
    console.log('\n>>> ALL LOGIN TESTS PASSED SUCCESSFULLY! <<<');
  } else {
    console.error('\n>>> SOME LOGIN TESTS FAILED <<<');
  }
}

testLogins();
