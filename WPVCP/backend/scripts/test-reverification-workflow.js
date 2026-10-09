const http = require('http');

function makeReq(options, postData) {
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
    if (postData) req.write(JSON.stringify(postData));
    req.end();
  });
}

async function loginAs(email, password = 'password123') {
  const res = await makeReq({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email, password });
  return res.data;
}

async function runReverificationSuite() {
  console.log('========================================================================================');
  console.log(' WPVCP - BIDIRECTIONAL DATA MODIFICATION & RE-VERIFICATION PROTOCOL TEST');
  console.log('========================================================================================\n');

  const results = [];

  try {
    // Step 0: Login as all 4 principal actors
    console.log('[1/7] Authenticating Customer, Planner, Vendor, and Master Admin...');
    const custLogin = await loginAs('rahul.anita@gmail.com');
    const plannerLogin = await loginAs('planner@wedding.com');
    const vendorLogin = await loginAs('shutter@wedding.com');
    const adminLogin = await loginAs('admin@wedding.com');

    if (!custLogin.token || !plannerLogin.token || !vendorLogin.token || !adminLogin.token) {
      throw new Error('Failed to obtain JWT auth tokens for all roles');
    }
    console.log('  ✓ Customer, Planner, Vendor, Admin authentication confirmed.\n');

    // ---------------------------------------------------------
    // TEST 1: Customer edits requirements -> Must become PENDING_PLANNER_VERIFICATION
    // ---------------------------------------------------------
    console.log('[2/7] Testing Customer Requirements Edit & Transition to PENDING_PLANNER_VERIFICATION...');
    // Fetch customer's own requirements
    const myReqRes = await makeReq({
      hostname: 'localhost',
      port: 5000,
      path: '/api/requirements/me',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${custLogin.token}` }
    });

    const activeReq = myReqRes.data.data?.[0];
    if (!activeReq) throw new Error('No active requirement record found for customer1');

    const updatedBudget = Math.round(parseFloat(activeReq.estimated_budget || 2000000) + 150000);
    const updatedGuestCount = (activeReq.guest_count || 350) + 50;

    const editReqRes = await makeReq({
      hostname: 'localhost',
      port: 5000,
      path: `/api/requirements/${activeReq.id}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${custLogin.token}`
      }
    }, {
      event_date: '2026-11-20',
      city: 'Bangalore Heritage Palace',
      guest_count: updatedGuestCount,
      estimated_budget: updatedBudget,
      status: 'SUBMITTED'
    });

    // Check status in database via API
    const checkEditedReq = await makeReq({
      hostname: 'localhost',
      port: 5000,
      path: '/api/requirements/me',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${custLogin.token}` }
    });
    const editedReqObj = checkEditedReq.data.data?.[0];

    const test1Passed = editReqRes.status === 200 && 
                        editedReqObj.verification_status === 'PENDING_PLANNER_VERIFICATION' &&
                        editedReqObj.last_edited_by === 'CUSTOMER';

    results.push({
      step: '1. Customer Edits Requirements',
      expected: 'Status -> PENDING_PLANNER_VERIFICATION, last_edited_by -> CUSTOMER',
      actual: `Status: ${editedReqObj?.verification_status} | EditedBy: ${editedReqObj?.last_edited_by}`,
      passed: test1Passed
    });
    console.log(`  ${test1Passed ? '✓ PASSED' : '✗ FAILED'}: Verification status transitioned to ${editedReqObj?.verification_status}\n`);

    // ---------------------------------------------------------
    // TEST 2: Planner Re-Verifies Requirements -> Must become VERIFIED & Sync Project
    // ---------------------------------------------------------
    console.log('[3/7] Testing Planner Re-Verification of Customer Requirements...');
    const verifyReqRes = await makeReq({
      hostname: 'localhost',
      port: 5000,
      path: `/api/requirements/${activeReq.id}/verify`,
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${plannerLogin.token}`
      }
    });

    const checkVerifiedReq = await makeReq({
      hostname: 'localhost',
      port: 5000,
      path: '/api/requirements/me',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${custLogin.token}` }
    });
    const verifiedReqObj = checkVerifiedReq.data.data?.[0];

    const test2Passed = verifyReqRes.status === 200 && verifiedReqObj.verification_status === 'VERIFIED';
    results.push({
      step: '2. Planner Re-Verifies Requirement',
      expected: 'Status -> VERIFIED and synchronized to linked project',
      actual: `Status: ${verifiedReqObj?.verification_status} | Change: ${verifiedReqObj?.change_summary?.substring(0, 50)}...`,
      passed: test2Passed
    });
    console.log(`  ${test2Passed ? '✓ PASSED' : '✗ FAILED'}: Requirements re-verified as ${verifiedReqObj?.verification_status}\n`);

    // ---------------------------------------------------------
    // TEST 3: Planner Edits Wedding Project -> Must become PENDING_CUSTOMER_VERIFICATION
    // ---------------------------------------------------------
    console.log('[4/7] Testing Planner Project Edit & Transition to PENDING_CUSTOMER_VERIFICATION...');
    const custProjectRes = await makeReq({
      hostname: 'localhost',
      port: 5000,
      path: '/api/projects/customer/active',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${custLogin.token}` }
    });
    let activeProject = custProjectRes.data.data;
    if (!activeProject) {
      const allProjects = await makeReq({
        hostname: 'localhost',
        port: 5000,
        path: '/api/projects',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${plannerLogin.token}` }
      });
      activeProject = allProjects.data.data?.[0];
    }
    if (!activeProject) throw new Error('No wedding projects found');

    const newProjectBudget = parseFloat(activeProject.total_budget || 2000000) + 100000;
    const editProjectRes = await makeReq({
      hostname: 'localhost',
      port: 5000,
      path: `/api/projects/${activeProject.id}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${plannerLogin.token}`
      }
    }, {
      title: activeProject.title,
      wedding_date: '2026-12-10',
      total_budget: newProjectBudget,
      guest_count: 450,
      city: activeProject.city || 'Bangalore'
    });

    const checkEditedProject = await makeReq({
      hostname: 'localhost',
      port: 5000,
      path: `/api/projects/${activeProject.id}`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${plannerLogin.token}` }
    });
    const editedProjectObj = checkEditedProject.data.data;

    const test3Passed = editProjectRes.status === 200 &&
                        editedProjectObj.verification_status === 'PENDING_CUSTOMER_VERIFICATION' &&
                        editedProjectObj.last_edited_by === 'PLANNER';

    results.push({
      step: '3. Planner Edits Wedding Project',
      expected: 'Status -> PENDING_CUSTOMER_VERIFICATION, last_edited_by -> PLANNER',
      actual: `Status: ${editedProjectObj?.verification_status} | EditedBy: ${editedProjectObj?.last_edited_by}`,
      passed: test3Passed
    });
    console.log(`  ${test3Passed ? '✓ PASSED' : '✗ FAILED'}: Project status transitioned to ${editedProjectObj?.verification_status}\n`);

    // ---------------------------------------------------------
    // TEST 4: Customer Re-Verifies Project -> Must become VERIFIED
    // ---------------------------------------------------------
    console.log('[5/7] Testing Customer Re-Verification of Project Updates...');
    const custVerifyRes = await makeReq({
      hostname: 'localhost',
      port: 5000,
      path: `/api/projects/${activeProject.id}/customer-verify`,
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${custLogin.token}`
      }
    });

    const checkCustVerifiedProject = await makeReq({
      hostname: 'localhost',
      port: 5000,
      path: `/api/projects/${activeProject.id}`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${plannerLogin.token}` }
    });
    const custVerifiedProjectObj = checkCustVerifiedProject.data.data;

    const test4Passed = custVerifyRes.status === 200 && custVerifiedProjectObj.verification_status === 'VERIFIED';
    results.push({
      step: '4. Customer Re-Verifies Project',
      expected: 'Status -> VERIFIED',
      actual: `Status: ${custVerifiedProjectObj?.verification_status} | Summary: ${custVerifiedProjectObj?.change_summary?.substring(0, 50)}...`,
      passed: test4Passed
    });
    console.log(`  ${test4Passed ? '✓ PASSED' : '✗ FAILED'}: Project successfully confirmed as ${custVerifiedProjectObj?.verification_status}\n`);

    // ---------------------------------------------------------
    // TEST 5: Vendor Edits Catalog Service -> Must become PENDING_PLANNER_VERIFICATION
    // ---------------------------------------------------------
    console.log('[6/7] Testing Vendor Service Edit & Transition to PENDING_PLANNER_VERIFICATION...');
    const vendorProfileRes = await makeReq({
      hostname: 'localhost',
      port: 5000,
      path: '/api/vendors/profile/me',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${vendorLogin.token}` }
    });
    const vendorServices = vendorProfileRes.data.data?.services || [];
    if (vendorServices.length === 0) throw new Error('No services registered for Taj West End vendor');
    const targetService = vendorServices[0];

    const updatedPrice = parseFloat(targetService.price || 50000) + 5000;
    const editServiceRes = await makeReq({
      hostname: 'localhost',
      port: 5000,
      path: `/api/vendors/services/${targetService.id}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${vendorLogin.token}`
      }
    }, {
      name: targetService.name,
      price: updatedPrice,
      pricing_unit: targetService.pricing_unit || 'per_event',
      description: 'Updated luxury heritage package with full concierge coordination',
      is_active: 1
    });

    const checkEditedService = await makeReq({
      hostname: 'localhost',
      port: 5000,
      path: '/api/vendors/profile/me',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${vendorLogin.token}` }
    });
    const editedServiceObj = checkEditedService.data.data?.services?.find(s => s.id === targetService.id);

    const test5Passed = editServiceRes.status === 200 &&
                        editedServiceObj.verification_status === 'PENDING_PLANNER_VERIFICATION';

    results.push({
      step: '5. Vendor Edits Service Catalog',
      expected: 'Status -> PENDING_PLANNER_VERIFICATION',
      actual: `Status: ${editedServiceObj?.verification_status} | Price: ₹${editedServiceObj?.price}`,
      passed: test5Passed
    });
    console.log(`  ${test5Passed ? '✓ PASSED' : '✗ FAILED'}: Vendor service transitioned to ${editedServiceObj?.verification_status}\n`);

    // ---------------------------------------------------------
    // TEST 6: Planner Re-Verifies Vendor Service -> Must become VERIFIED
    // ---------------------------------------------------------
    console.log('[7/7] Testing Planner / Admin Re-Verification of Vendor Service...');
    const verifyServiceRes = await makeReq({
      hostname: 'localhost',
      port: 5000,
      path: `/api/vendors/services/${targetService.id}/verify`,
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${plannerLogin.token}`
      }
    });

    const checkVerifiedService = await makeReq({
      hostname: 'localhost',
      port: 5000,
      path: '/api/vendors/profile/me',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${vendorLogin.token}` }
    });
    const verifiedServiceObj = checkVerifiedService.data.data?.services?.find(s => s.id === targetService.id);

    const test6Passed = verifyServiceRes.status === 200 && verifiedServiceObj.verification_status === 'VERIFIED';
    results.push({
      step: '6. Planner Re-Verifies Vendor Service',
      expected: 'Status -> VERIFIED',
      actual: `Status: ${verifiedServiceObj?.verification_status} | Summary: ${verifiedServiceObj?.change_summary?.substring(0, 50)}...`,
      passed: test6Passed
    });
    console.log(`  ${test6Passed ? '✓ PASSED' : '✗ FAILED'}: Vendor service approved as ${verifiedServiceObj?.verification_status}\n`);

    // ---------------------------------------------------------
    // TEST 7: Admin Super-Verification on Requirements & Projects
    // ---------------------------------------------------------
    console.log('[8/8] Testing Admin Super-Verification Oversight...');
    // Customer edits requirement again
    await makeReq({
      hostname: 'localhost',
      port: 5000,
      path: `/api/requirements/${activeReq.id}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${custLogin.token}`
      }
    }, {
      guest_count: 500,
      estimated_budget: 2500000,
      status: 'SUBMITTED'
    });

    // Admin verifies directly
    const adminVerifyRes = await makeReq({
      hostname: 'localhost',
      port: 5000,
      path: `/api/requirements/${activeReq.id}/verify`,
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${adminLogin.token}` }
    });

    const checkAdminReq = await makeReq({
      hostname: 'localhost',
      port: 5000,
      path: '/api/requirements/me',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${custLogin.token}` }
    });
    const adminReqObj = checkAdminReq.data.data?.[0];

    const test7Passed = adminVerifyRes.status === 200 && adminReqObj.verification_status === 'VERIFIED';
    results.push({
      step: '7. Admin Super-Verification Authority',
      expected: 'Status -> VERIFIED by Executive Administrator',
      actual: `Status: ${adminReqObj?.verification_status} | Summary: ${adminReqObj?.change_summary?.substring(0, 50)}...`,
      passed: test7Passed
    });
    console.log(`  ${test7Passed ? '✓ PASSED' : '✗ FAILED'}: Admin super-verification confirmed as ${adminReqObj?.verification_status}\n`);

  } catch (err) {
    console.error('Test execution error:', err);
    results.push({
      step: 'Exception during test execution',
      expected: 'No uncaught exceptions',
      actual: err.message,
      passed: false
    });
  }

  // Print Summary Table
  console.log('========================================================================================');
  console.log(' RE-VERIFICATION PROTOCOL RESULTS MATRIX');
  console.log('========================================================================================');
  console.table(results);

  const allPassed = results.every(r => r.passed);
  console.log(`\nOVERALL PROTOCOL STATUS: ${allPassed ? '>>> ALL 7 RE-VERIFICATION TESTS PASSED (100%) <<<' : '>>> SOME TESTS FAILED <<<'}`);
  process.exit(allPassed ? 0 : 1);
}

runReverificationSuite();
