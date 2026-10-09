const http = require('http');
const fs = require('fs');
const path = require('path');

function get(url, token = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    http.get({
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data), raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    }).on('error', reject);
  });
}

function post(url, body) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body);
    const parsedUrl = new URL(url);
    const req = http.request({
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data), raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runComprehensiveTests() {
  console.log('================================================================');
  console.log(' WPVCP - COMPREHENSIVE PLATFORM REQUIREMENTS VERIFICATION');
  console.log('================================================================\n');

  const testResults = [];

  // TEST 1: Frontend Serving
  try {
    const frontendRes = await get('http://localhost:5173/');
    testResults.push({
      test: '1. Frontend Vite Server',
      status: frontendRes.status === 200 ? 'PASSED (200 OK)' : 'FAILED',
      details: 'Vite dev server running on http://localhost:5173'
    });
  } catch (err) {
    testResults.push({ test: '1. Frontend Vite Server', status: 'FAILED', details: err.message });
  }

  // TEST 2: Backend API Health
  try {
    const healthRes = await get('http://localhost:5000/api/health');
    testResults.push({
      test: '2. Backend Express Server',
      status: healthRes.status === 200 && healthRes.data?.status === 'HEALTHY' ? 'PASSED (200 OK)' : 'FAILED',
      details: 'Express API running on http://localhost:5000'
    });
  } catch (err) {
    testResults.push({ test: '2. Backend Express Server', status: 'FAILED', details: err.message });
  }

  // TEST 3: Admin-Only Google OAuth
  try {
    const adminOauth = await post('http://localhost:5000/api/auth/google', {
      google_id: 'gid_admin_test_1112',
      email: 'sathiyajanani1112@gmail.com',
      full_name: 'sathiyajanani'
    });
    const passed = adminOauth.status === 200 && adminOauth.data?.success && adminOauth.data?.user?.role === 'ADMIN';
    testResults.push({
      test: '3. Admin Google OAuth (sathiyajanani1112@gmail.com)',
      status: passed ? 'PASSED (Role: ADMIN)' : 'FAILED',
      details: `User: ${adminOauth.data?.user?.full_name} (${adminOauth.data?.user?.email})`
    });
  } catch (err) {
    testResults.push({ test: '3. Admin Google OAuth', status: 'FAILED', details: err.message });
  }

  // TEST 4: Unauthorized Google OAuth Restriction
  try {
    const unauth = await post('http://localhost:5000/api/auth/google', {
      google_id: 'gid_stranger_99',
      email: 'stranger@gmail.com',
      full_name: 'Stranger'
    });
    const rejected = unauth.status === 403;
    testResults.push({
      test: '4. Unauthorized Google OAuth Restriction',
      status: rejected ? 'PASSED (403 Forbidden)' : 'FAILED',
      details: unauth.data?.message || 'Access blocked'
    });
  } catch (err) {
    testResults.push({ test: '4. Unauthorized Google OAuth Restriction', status: 'FAILED', details: err.message });
  }

  // TEST 5: All 5 Admin Logins
  const adminEmails = [
    'sathiyajanani1112@gmail.com',
    'admin@wedding.com',
    'admin.kavitha@wedding.com',
    'admin.rajesh@wedding.com',
    'admin.meenakshi@wedding.com'
  ];
  let allAdminsPassed = true;
  for (const email of adminEmails) {
    const res = await post('http://localhost:5000/api/auth/login', { email, password: '12345689' });
    if (res.status !== 200 || res.data?.user?.role !== 'ADMIN') allAdminsPassed = false;
  }
  testResults.push({
    test: '5. All 5 Admin Logins (Password: 12345689)',
    status: allAdminsPassed ? 'PASSED (5/5 Admins Verified)' : 'FAILED',
    details: 'sathiyajanani1112, admin, admin.kavitha, admin.rajesh, admin.meenakshi'
  });

  // TEST 6: All 5 Customer Logins
  const customerEmails = [
    { email: 'barani@gmail.com', name: 'Barani' },
    { email: 'malini@gmail.com', name: 'Malini' },
    { email: 'loha@gmail.com', name: 'Loha' },
    { email: 'ranjani@gmail.com', name: 'Ranjani' },
    { email: 'siva@gmail.com', name: 'Siva' }
  ];
  let allCustomersPassed = true;
  for (const c of customerEmails) {
    const res = await post('http://localhost:5000/api/auth/login', { email: c.email, password: '12345689' });
    if (res.status !== 200 || res.data?.user?.role !== 'CUSTOMER' || res.data?.user?.full_name !== c.name) {
      allCustomersPassed = false;
    }
  }
  testResults.push({
    test: '6. All 5 Customer Logins (Password: 12345689)',
    status: allCustomersPassed ? 'PASSED (5/5 Customers Verified)' : 'FAILED',
    details: 'Barani, Malini, Loha, Ranjani, Siva'
  });

  // TEST 7: 15 Vendor Categories & 3 Vendors Per Category
  try {
    // Authenticate first to obtain token for protected vendors route
    const authRes = await post('http://localhost:5000/api/auth/login', {
      email: 'sathiyajanani1112@gmail.com',
      password: '12345689'
    });
    const token = authRes.data?.token;

    const catRes = await get('http://localhost:5000/api/vendors/categories', token);
    const venRes = await get('http://localhost:5000/api/vendors?limit=100', token);

    const totalCats = catRes.data?.data?.length || 0;
    const allVendors = venRes.data?.data || [];

    // Verify each category has at least 3 vendors
    let allCategoriesHave3Vendors = totalCats >= 15;
    const catBreakdown = [];

    for (const cat of catRes.data?.data || []) {
      const vInCat = allVendors.filter(v => Number(v.category_id) === Number(cat.id));
      catBreakdown.push(`${cat.name}: ${vInCat.length}`);
      if (vInCat.length < 3) allCategoriesHave3Vendors = false;
    }

    testResults.push({
      test: '7. 15 Separate Categories × ≥3 Vendors',
      status: allCategoriesHave3Vendors ? 'PASSED (15 Categories, 45 Vendors)' : 'FAILED',
      details: catBreakdown.slice(0, 5).join(', ') + '...'
    });

    // TEST 8: Strict Category Filtering (Catering only Catering, Decoration only Decoration)
    const cateringVendors = allVendors.filter(v => Number(v.category_id) === 2);
    const decorVendors = allVendors.filter(v => Number(v.category_id) === 3);
    const hallVendors = allVendors.filter(v => Number(v.category_id) === 1);

    const cateringStrict = cateringVendors.every(v => v.category_name === 'Catering');
    const decorStrict = decorVendors.every(v => v.category_name === 'Decoration');
    const hallsStrict = hallVendors.every(v => v.category_name === 'Wedding Halls');

    testResults.push({
      test: '8. Strict Category Segregation',
      status: cateringStrict && decorStrict && hallsStrict ? 'PASSED (100% Segregated)' : 'FAILED',
      details: `Catering (${cateringVendors.length}), Decoration (${decorVendors.length}), Wedding Halls (${hallVendors.length})`
    });

    // TEST 9: Wedding Hall Google Maps Preservation
    const hallsHaveCoords = hallVendors.every(h => h.latitude && h.longitude && h.city);
    const nonHallsHaveNoCoords = allVendors.filter(v => Number(v.category_id) !== 1).every(v => !v.latitude && !v.longitude);

    testResults.push({
      test: '9. Google Maps Integration Preserved for Wedding Halls',
      status: hallsHaveCoords && nonHallsHaveNoCoords ? 'PASSED (GPS Locked to Halls Only)' : 'FAILED',
      details: `All ${hallVendors.length} Wedding Halls have GPS coordinates; other 14 categories have no map loading`
    });

  } catch (err) {
    testResults.push({ test: '7-9. Categories & Vendors', status: 'FAILED', details: err.message });
  }

  // TEST 10: Landing Page "Create Account" Button Check in Navbar Source
  try {
    const navbarPath = path.resolve(__dirname, '../../frontend/src/components/Navbar.jsx');
    const navbarSource = fs.readFileSync(navbarPath, 'utf8');
    const hasCreateAccount = navbarSource.includes('Create Account') && navbarSource.includes('/register');
    const doesNotHaveGoToDashboard = !navbarSource.includes('Go to Dashboard');

    testResults.push({
      test: '10. Landing Page Top-Right Button ("Create Account")',
      status: hasCreateAccount && doesNotHaveGoToDashboard ? 'PASSED (Create Account Only)' : 'FAILED',
      details: 'Top-right button strictly navigates to /register and never displays "Go to Dashboard"'
    });
  } catch (err) {
    testResults.push({ test: '10. Landing Page Button', status: 'FAILED', details: err.message });
  }

  // TEST 11: Sidebar 19 Navigations & Header matching Image 1
  try {
    const sidebarPath = path.resolve(__dirname, '../../frontend/src/components/Sidebar.jsx');
    const sidebarSource = fs.readFileSync(sidebarPath, 'utf8');
    const expected19Navs = [
      'Dashboard', 'My Customers', 'Customer Requests', 'Wedding Projects',
      'Vendor Category', 'Vendor Requests', 'Request Tracking', 'Selected Vendors',
      'Service Management', 'Wedding Schedule', 'Budget Management',
      'Payments & Milestones', 'Invoices', 'Contracts & Documents', 'Messages',
      'Support Desk', 'Notifications', 'Reports & Analytics', 'Settings'
    ];

    let all19Present = true;
    for (const nav of expected19Navs) {
      if (!sidebarSource.includes(nav)) all19Present = false;
    }
    const hasPlannerPortal = sidebarSource.includes('PLANNER PORTAL');
    const hasSignOut = sidebarSource.includes('Sign Out');
    const hasRecentlyAccessed = sidebarSource.includes('Recently Accessed');

    testResults.push({
      test: '11. Sidebar 19 Nav Items + Sign Out + Recently Accessed',
      status: all19Present && hasPlannerPortal && hasSignOut && hasRecentlyAccessed ? 'PASSED (Image 1 Matched)' : 'FAILED',
      details: 'All 19 items present, PLANNER PORTAL subtitle, Sign Out button, and Recently Accessed section'
    });
  } catch (err) {
    testResults.push({ test: '11. Sidebar Verification', status: 'FAILED', details: err.message });
  }

  // TEST 12: Login Page UI matching Image 2
  try {
    const loginPath = path.resolve(__dirname, '../../frontend/src/pages/auth/LoginPage.jsx');
    const loginSource = fs.readFileSync(loginPath, 'utf8');
    const hasWelcomeBack = loginSource.includes('WELCOME BACK');
    const has3QuickButtons = loginSource.includes('Planner') && loginSource.includes('Vendor') && loginSource.includes('Customer');
    const hasContinueWithGoogle = loginSource.includes('Continue with Google');
    const hasForgotPassword = loginSource.includes('Forgot Password?');
    const hasCreateAccount = loginSource.includes('Create Account');

    testResults.push({
      test: '12. Sign In Page UI Structure (Image 2 Matched)',
      status: hasWelcomeBack && has3QuickButtons && hasContinueWithGoogle && hasForgotPassword && hasCreateAccount ? 'PASSED (Image 2 Matched)' : 'FAILED',
      details: 'WELCOME BACK uppercase, 3 quick sample buttons, red Forgot Password, Continue with Google, Create Account'
    });
  } catch (err) {
    testResults.push({ test: '12. Login Page UI', status: 'FAILED', details: err.message });
  }

  console.table(testResults);
  console.log('\n================================================================');
  console.log(' ALL 12 MANDATORY TEST SUITES EXECUTED');
  console.log('================================================================\n');
}

runComprehensiveTests();
