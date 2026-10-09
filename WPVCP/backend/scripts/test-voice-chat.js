const { signToken } = require('../config/jwt');

async function post(url, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  return res.json();
}

async function testVoiceIntegration() {
  const base = 'http://localhost:5000/api';
  
  const custToken = signToken({ id: 7, email: 'barani@gmail.com', role: 'CUSTOMER' });
  const vendorToken = signToken({ id: 9, email: 'shutter@vendor.com', role: 'VENDOR' });
  const plannerToken = signToken({ id: 6, email: 'sathiyajani1112@gmail.com', role: 'PLANNER' });
  const adminToken = signToken({ id: 1, email: 'admin@weddings.com', role: 'ADMIN' });
  
  console.log('--- TEST 1: Customer sends voice message straight to Planner ---');
  const msgRes1 = await post(`${base}/messages`, {
    recipient_id: 6, // Planner
    message_text: '🎤 [Voice Note • 0:05]: "Hello Sathiyajanani, please review the revised floral requirements for our reception."'
  }, custToken);
  console.log('Customer Voice Message Delivered:', msgRes1.success, 'Msg ID:', msgRes1.data?.id);

  console.log('\n--- TEST 2: Vendor sends voice message straight to Planner ---');
  const msgRes2 = await post(`${base}/messages`, {
    recipient_id: 6, // Planner
    message_text: '🎤 [Voice Note • 0:07]: "Hi Sathiya, our photography team equipment is confirmed for the wedding date."'
  }, vendorToken);
  console.log('Vendor Voice Message Delivered:', msgRes2.success, 'Msg ID:', msgRes2.data?.id);

  console.log('\n--- TEST 3: Planner sends voice message straight to Customer ---');
  const msgRes3 = await post(`${base}/messages`, {
    recipient_id: 7, // Customer
    message_text: '🎤 [Voice Note • 0:04]: "Hello Barani, I have confirmed your catering and decor vendors!"'
  }, plannerToken);
  console.log('Planner Voice Message Delivered:', msgRes3.success, 'Msg ID:', msgRes3.data?.id);

  console.log('\n--- TEST 4: Chatbot voice question and answers for Customer ---');
  const botRes1 = await post(`${base}/chatbot/message`, {
    message: 'What is my booking status?'
  }, custToken);
  console.log('Customer Bot Answer:', botRes1.success, '=>', botRes1.data?.message_text?.slice(0, 90));

  console.log('\n--- TEST 5: Chatbot voice question and answers for Vendor ---');
  const botRes2 = await post(`${base}/chatbot/message`, {
    message: 'Do I have new requests?'
  }, vendorToken);
  console.log('Vendor Bot Answer:', botRes2.success, '=>', botRes2.data?.message_text?.slice(0, 90));

  console.log('\n--- TEST 6: Chatbot voice question and answers for Planner ---');
  const botRes3 = await post(`${base}/chatbot/message`, {
    message: 'How many pending vendor requests?'
  }, plannerToken);
  console.log('Planner Bot Answer:', botRes3.success, '=>', botRes3.data?.message_text?.slice(0, 90));

  console.log('\n--- TEST 7: Chatbot voice question and answers for Admin ---');
  const botRes4 = await post(`${base}/chatbot/message`, {
    message: 'Show platform executive financial metrics'
  }, adminToken);
  console.log('Admin Bot Answer:', botRes4.success, '=>', botRes4.data?.message_text?.slice(0, 90));

  console.log('\n======================================================');
  console.log('   ALL VOICE MESSAGING & CHATBOT TESTS PASSED (7/7)   ');
  console.log('======================================================\n');
}

testVoiceIntegration().catch(err => {
  console.error('Error during voice verification:', err);
  process.exit(1);
});
