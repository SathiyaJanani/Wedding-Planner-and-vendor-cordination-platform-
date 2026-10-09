const http = require('http');

const USERS_TO_TEST = [
  // 5 Admins (Password: 12345689)
  { role: 'ADMIN 1', email: 'sathiyajanani1112@gmail.com', password: '12345689', name: 'sathiyajanani' },
  { role: 'ADMIN 2', email: 'admin@wedding.com', password: '12345689', name: 'Executive Administrator' },
  { role: 'ADMIN 3', email: 'admin.kavitha@wedding.com', password: '12345689', name: 'Kavitha Admin' },
  { role: 'ADMIN 4', email: 'admin.rajesh@wedding.com', password: '12345689', name: 'Rajesh Admin' },
  { role: 'ADMIN 5', email: 'admin.meenakshi@wedding.com', password: '12345689', name: 'Meenakshi Admin' },

  // 1 Planner
  { role: 'PLANNER', email: 'planner@wedding.com', password: '12345689', name: 'Priya Sharma' },

  // 5 Customers (Barani, Malini, Loha, Ranjani, Siva)
  { role: 'CUSTOMER 1', email: 'barani@gmail.com', password: '12345689', name: 'Barani' },
  { role: 'CUSTOMER 2', email: 'malini@gmail.com', password: '12345689', name: 'Malini' },
  { role: 'CUSTOMER 3', email: 'loha@gmail.com', password: '12345689', name: 'Loha' },
  { role: 'CUSTOMER 4', email: 'ranjani@gmail.com', password: '12345689', name: 'Ranjani' },
  { role: 'CUSTOMER 5', email: 'siva@gmail.com', password: '12345689', name: 'Siva' },

  // 5 Sample Vendors
  { role: 'VENDOR (Photography)', email: 'shutter@wedding.com', password: '12345689', name: 'Vikram Rathore' },
  { role: 'VENDOR (Decoration)', email: 'floral@wedding.com', password: '12345689', name: 'Ananya Roy' },
  { role: 'VENDOR (Wedding Hall)', email: 'grandpalace@wedding.com', password: '12345689', name: 'Sanjay Singhania' },
  { role: 'VENDOR (Catering)', email: 'royalcatering@wedding.com', password: '12345689', name: 'Chef Rajesh Nair' },
  { role: 'VENDOR (Makeup)', email: 'glamour@wedding.com', password: '12345689', name: 'Kavita Menon' }
];

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runLoginVerification() {
  console.log('========================================================================');
  console.log(' WPVCP - Authentication & Role Verification Suite');
  console.log(' Target: http://localhost:5000');
  console.log(' Password for all users: 12345689');
  console.log('========================================================================\n');

  const results = [];

  for (const account of USERS_TO_TEST) {
    try {
      const loginRes = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { email: account.email, password: account.password });

      if (loginRes.status !== 200 || !loginRes.data.success || !loginRes.data.token) {
        results.push({
          role: account.role,
          email: account.email,
          login: 'FAILED',
          jwt: 'NONE',
          profile_me: 'SKIPPED',
          notes: loginRes.data?.message || 'HTTP ' + loginRes.status
        });
        continue;
      }

      const token = loginRes.data.token;
      const user = loginRes.data.user;

      const meRes = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/me',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const mePassed = meRes.status === 200 && meRes.data?.success && meRes.data?.user?.email === account.email;

      results.push({
        role: account.role,
        email: account.email,
        full_name: user.full_name,
        role_assigned: user.role,
        login: 'PASSED (200 OK)',
        jwt: 'VALID',
        profile_me: mePassed ? 'PASSED' : 'FAILED',
        phone: user.phone || 'N/A'
      });

    } catch (err) {
      results.push({
        role: account.role,
        email: account.email,
        login: 'ERROR',
        jwt: 'ERROR',
        profile_me: 'ERROR',
        notes: err.message
      });
    }
  }

  // 2. Test Admin Google OAuth Flow (sathiyajanani1112@gmail.com)
  console.log('\n--- Testing Admin Google OAuth (sathiyajanani1112@gmail.com) ---');
  try {
    const oauthRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/google',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      google_id: 'google_test_verified_1112',
      email: 'sathiyajanani1112@gmail.com',
      full_name: 'sathiyajanani',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'
    });

    const oauthPassed = oauthRes.status === 200 && oauthRes.data?.success && oauthRes.data?.user?.role === 'ADMIN';
    console.log(`Admin OAuth (sathiyajanani1112@gmail.com): ${oauthPassed ? 'PASSED (Role: ADMIN, Token Issued)' : 'FAILED'}`);
  } catch (err) {
    console.error('Admin OAuth test error:', err.message);
  }

  // 3. Test Unauthorized Google OAuth attempt (non-admin email)
  console.log('\n--- Testing Unauthorized Google OAuth (Should be restricted) ---');
  try {
    const unauthRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/google',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      google_id: 'google_unauthorized_user',
      email: 'stranger@gmail.com',
      full_name: 'Unauthorized Stranger'
    });

    const isRestricted = unauthRes.status === 403;
    console.log(`Unauthorized OAuth Restriction: ${isRestricted ? 'PASSED (Properly Rejected with 403 Forbidden)' : 'FAILED (' + unauthRes.status + ')'}`);
    console.log(`Message: ${unauthRes.data?.message}`);
  } catch (err) {
    console.error('Unauthorized test error:', err.message);
  }

  // 4. Test Admin Metrics Endpoint
  console.log('\n--- Testing Admin Metrics Endpoint (/api/admin/metrics) ---');
  try {
    const adminLoginRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'sathiyajanani1112@gmail.com', password: '12345689' });

    if (adminLoginRes.data?.token) {
      const metricsRes = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/admin/metrics',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${adminLoginRes.data.token}` }
      });
      console.log('Admin Metrics Status:', metricsRes.status);
      if (metricsRes.data?.success) {
        console.log('Metrics Summary:', JSON.stringify(metricsRes.data.data.users));
      }
    }
  } catch (e) {
    console.error('Admin metrics error:', e.message);
  }

  console.log('\n========================================================================');
  console.log(' VERIFICATION SUMMARY TABLE:');
  console.log('========================================================================');
  console.table(results);
  console.log('========================================================================\n');
}

runLoginVerification();
