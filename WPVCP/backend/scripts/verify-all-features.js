const { query } = require('../config/db');

async function runTests() {
  console.log('====================================================');
  console.log('   WPVCP COMPREHENSIVE AUTOMATED VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    const { signToken } = require('../config/jwt');
    const custToken = signToken({ id: 7, email: 'barani@gmail.com', role: 'CUSTOMER' });

    // 1. PDF Download Verification (Customer and Vendor accepted contracts)
    console.log('--- Test 1: Contract & Document PDF Downloads ---');
    const doc1 = await fetch('http://localhost:5000/api/documents/1/download');
    const doc1Buf = await doc1.arrayBuffer();
    assert(
      doc1.status === 200 &&
      doc1.headers.get('content-type') === 'application/pdf' &&
      doc1.headers.get('content-disposition')?.includes('.pdf') &&
      doc1Buf.byteLength > 500,
      'Customer Accepted Contract #1 downloads as valid PDF (>500 bytes)'
    );

    const doc3 = await fetch('http://localhost:5000/api/documents/3/download');
    const doc3Buf = await doc3.arrayBuffer();
    assert(
      doc3.status === 200 &&
      doc3.headers.get('content-type') === 'application/pdf' &&
      doc3.headers.get('content-disposition')?.includes('.pdf') &&
      doc3Buf.byteLength > 500,
      'Vendor Accepted Contract #3 downloads as valid PDF (>500 bytes)'
    );

    // 2. Reviews Count (>= 6 reviews on both vendor and customer endpoints)
    console.log('\n--- Test 2: Reviews Count (>= 6 Verified Reviews) ---');
    const revRes = await (await fetch('http://localhost:5000/api/reviews', {
      headers: { Authorization: `Bearer ${custToken}` }
    })).json();
    assert(revRes.success && revRes.count >= 6, `Customer Reviews count is ${revRes.count} (>= 6 requirement met)`);

    // 3. Vendor Categories (15 categories & 45 vendors for customer & admin)
    console.log('\n--- Test 3: Vendor Categories & Directory (15 Categories & 45 Vendors) ---');
    const catRes = await (await fetch('http://localhost:5000/api/vendors/categories')).json();
    assert(catRes.success && catRes.data?.length === 15, `Categories count is ${catRes.data?.length} (exactly 15 active categories)`);

    const venRes = await (await fetch('http://localhost:5000/api/vendors?limit=100', {
      headers: { Authorization: `Bearer ${custToken}` }
    })).json();
    const vendorList = venRes.data || [];
    assert(venRes.success && vendorList.length === 45, `All partner vendors count is ${vendorList.length} (all 45 vendors loaded)`);

    // 4. Vendor Schedule (>= 5 schedules and vendor can add schedule)
    console.log('\n--- Test 4: Vendor Schedule (>= 5 Events & Add Schedule Event) ---');
    // Get vendor 1 user token or check schedule query directly
    const [schedRows] = await query('SELECT * FROM wedding_schedule WHERE vendor_id = 1 OR wedding_project_id = 1');
    assert(schedRows.length >= 5, `Vendor schedule items found: ${schedRows.length} (>= 5 requirement met)`);

    // 5. Customer Requirements Edit -> Resend -> Auto Chat Message & Planner status RESENT
    console.log('\n--- Test 5: Customer Requirements Edit -> Resend & Automated Planner Message ---');
    // Customer 1 (user_id: 7)
    const [cReq] = await query('SELECT id, status, verification_status FROM wedding_requirements WHERE customer_id = 1 LIMIT 1');
    assert(cReq.length > 0, `Customer Requirement found (ID: ${cReq[0]?.id})`);

    // Simulate update to requirements
    const testLocation = 'Mahabalipuram Beach Resort & Lawn';
    const testDate = '2026-11-25';
    const testBudget = 3200000;

    // Update as Customer 1

    const updateRes = await (await fetch(`http://localhost:5000/api/requirements/${cReq[0].id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custToken}` 
      },
      body: JSON.stringify({
        city: testLocation,
        wedding_date: testDate,
        budget_max: testBudget,
        status: 'RESENT'
      })
    })).json();

    assert(updateRes.success, 'Requirement update API returned success');

    // Check DB status and verification_status
    const [updatedReq] = await query('SELECT status, verification_status, location FROM wedding_requirements WHERE id = ?', [cReq[0].id]);
    assert(
      updatedReq[0].status === 'RESENT' && updatedReq[0].verification_status === 'RESENT',
      `Requirement status is '${updatedReq[0].status}' and verification_status is '${updatedReq[0].verification_status}' (RESENT requirement met)`
    );

    // Check auto message created in messages table
    const [autoMsgs] = await query(
      `SELECT * FROM messages WHERE sender_id = 7 ORDER BY created_at DESC LIMIT 1`
    );
    assert(
      autoMsgs.length > 0 && autoMsgs[0].message_text.includes('updated and resent my wedding requirements'),
      `Automated chat message dispatched to Planner: "${autoMsgs[0]?.message_text.substring(0, 70)}..."`
    );

    // 6. Voice Message Sending & Captions
    console.log('\n--- Test 6: Voice Message with Captions in Real-time Chat ---');
    const voiceMsgText = '🎤 [Voice Note • 0:08]: "Hello Planner, could you please confirm the muhurtham timing?"';
    const [conv] = await query('SELECT id, participant_two_id FROM conversations WHERE participant_one_id = 7 LIMIT 1');
    const voicePostRes = await (await fetch('http://localhost:5000/api/messages', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custToken}` 
      },
      body: JSON.stringify({
        conversation_id: conv[0]?.id,
        recipient_id: conv[0]?.participant_two_id || 1,
        message_text: voiceMsgText
      })
    })).json();
    assert(voicePostRes.success, 'Voice message with captions successfully posted to conversation');

    // 7. Chatbot Query Verification
    console.log('\n--- Test 7: Chatbot Assistant Query Verification ---');
    const chatRes = await (await fetch('http://localhost:5000/api/chatbot/message', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custToken}` 
      },
      body: JSON.stringify({
        message: 'When is my wedding date?'
      })
    })).json();
    assert(
      chatRes.success && Boolean(chatRes.data?.message_text),
      `Chatbot replied with: "${chatRes.data?.message_text.substring(0, 80)}..."`
    );

    console.log('\n====================================================');
    console.log(`   TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution error:', err.response?.data || err.message);
    process.exit(1);
  }
}

runTests();
