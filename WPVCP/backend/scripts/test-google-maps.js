const http = require('http');
const { isWeddingHallVendor } = require('../utils/weddingHallHelper');

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch(e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(JSON.stringify(postData));
    req.end();
  });
}

async function login(email, password = 'password123') {
  const res = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email, password });
  return res.body?.token;
}

async function runTests() {
  console.log('========================================================================');
  console.log(' GOOGLE MAPS INTEGRATION & CATEGORY RESTRICTION VERIFICATION');
  console.log('========================================================================\n');

  console.log('--- TEST 1: Strict Category Restriction Helper ---');
  const catTests = [
    { input: 'Wedding Hall', expected: true, label: 'Wedding Hall (Exact Name)' },
    { input: 'wedding-hall', expected: true, label: 'wedding-hall (Slug)' },
    { input: { category_id: 1, name: 'Wedding Hall' }, expected: true, label: '{ category_id: 1 } (Object)' },
    { input: 'Photography', expected: false, label: 'Photography (Must be Hidden)' },
    { input: 'Catering', expected: false, label: 'Catering (Must be Hidden)' },
    { input: 'Makeup', expected: false, label: 'Makeup (Must be Hidden)' },
    { input: 'Decoration', expected: false, label: 'Decoration (Must be Hidden)' },
    { input: 'DJ', expected: false, label: 'DJ (Must be Hidden)' },
    { input: 'Transportation', expected: false, label: 'Transportation (Must be Hidden)' }
  ];

  let catSuccess = true;
  for (const t of catTests) {
    const res = isWeddingHallVendor(t.input);
    const pass = res === t.expected;
    if (!pass) catSuccess = false;
    console.log(`  [${pass ? 'PASS' : 'FAIL'}] ${t.label} => Result: ${res}`);
  }

  console.log('\n--- TEST 2: Backend Validation for Wedding Hall vs Other Vendors ---');
  // 1. Wedding Hall Login & Coordinate Update
  const hallToken = await login('grandpalace@wedding.com');
  const hallUpdate = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/vendors/3',
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + hallToken }
  }, { latitude: 12.9982, longitude: 77.5921 });

  const hallPass = hallUpdate.status === 200 && hallUpdate.body?.success === true;
  console.log(`  [${hallPass ? 'PASS' : 'FAIL'}] Wedding Hall updating coordinates (allowed): HTTP ${hallUpdate.status}`);

  // 2. Photography Vendor Try to Update Coordinates (MUST BE REJECTED 400)
  const photoToken = await login('shutter@wedding.com');
  const photoUpdate = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/vendors/1',
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + photoToken }
  }, { latitude: 12.3456, longitude: 78.9012 });

  const photoPass = photoUpdate.status === 400 && photoUpdate.body?.success === false;
  console.log(`  [${photoPass ? 'PASS' : 'FAIL'}] Photography updating coordinates (must reject): HTTP ${photoUpdate.status} - "${photoUpdate.body?.message}"`);

  // 3. Catering Vendor Try to Update Coordinates (MUST BE REJECTED 400)
  const caterToken = await login('royalcatering@wedding.com');
  const caterUpdate = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/vendors/4',
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + caterToken }
  }, { latitude: 12.3456, longitude: 78.9012 });

  const caterPass = caterUpdate.status === 400 && caterUpdate.body?.success === false;
  console.log(`  [${caterPass ? 'PASS' : 'FAIL'}] Catering updating coordinates (must reject): HTTP ${caterUpdate.status} - "${caterUpdate.body?.message}"`);

  console.log('\n--- TEST 3: Stored Location in Wedding Hall Profile ---');
  const hallProfile = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/vendors/profile/me',
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + hallToken }
  });

  const pData = hallProfile.body?.data;
  console.log(`  Venue: ${pData?.business_name}`);
  console.log(`  Category: ${pData?.category_name}`);
  console.log(`  Address: ${pData?.address}, ${pData?.city}, ${pData?.state} - ${pData?.postal_code}`);
  console.log(`  Coordinates: Lat ${pData?.latitude}, Lng ${pData?.longitude}`);

  const coordsValid = pData?.latitude !== null && pData?.longitude !== null;
  console.log(`  [${coordsValid ? 'PASS' : 'FAIL'}] Wedding Hall coordinates persisted in database`);

  console.log('\n========================================================================');
  const allGood = catSuccess && hallPass && photoPass && caterPass && coordsValid;
  console.log(` OVERALL RESULT: ${allGood ? 'ALL VERIFICATIONS PASSED (100%)' : 'SOME CHECKS FAILED'}`);
  console.log('========================================================================\n');
  process.exit(allGood ? 0 : 1);
}

runTests().catch(e => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
