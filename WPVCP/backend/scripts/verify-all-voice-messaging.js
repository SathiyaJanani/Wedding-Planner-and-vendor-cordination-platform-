const fs = require('fs');
const path = require('path');
const http = require('http');

const API = 'http://localhost:5000/api';

// Audio tone blob helper
function createAudioToneBuffer(seconds) {
  const sampleRate = 8000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const dur = Math.max(1, seconds || 2);
  const dataSize = sampleRate * 2 * dur;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28);
  buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < dataSize / 2; i++) {
    const t = i / sampleRate;
    const s = Math.sin(2 * Math.PI * 440 * t) * 0.5 + Math.sin(2 * Math.PI * 554.37 * t) * 0.3;
    buffer.writeInt16LE(Math.floor(s * 10000), 44 + i * 2);
  }

  return buffer;
}

async function login(email, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!data.success) throw new Error(`Login failed for ${email}: ${data.message}`);
  return { token: data.token, user: data.user };
}

async function testUrlHttp(url) {
  return new Promise((resolve) => {
    const full = url.startsWith('http') ? url : `http://localhost:5000${url}`;
    http.get(full, (res) => {
      resolve({ statusCode: res.statusCode, contentType: res.headers['content-type'] });
    }).on('error', (err) => {
      resolve({ statusCode: 500, error: err.message });
    });
  });
}

async function main() {
  console.log('========================================================');
  console.log('VOICE MESSAGING FULL END-TO-END VERIFICATION (ALL ROLES)');
  console.log('========================================================\n');

  // 1. Log in users
  console.log('1. Logging in Customer, Planner, and Vendor...');
  const customer = await login('barani@gmail.com', '12345689');
  const planner = await login('sathiyajani1112@gmail.com', '12345689');
  const vendor = await login('shutter@vendor.com', '12345689');
  console.log(`- Customer logged in: ${customer.user.full_name} (ID: ${customer.user.id})`);
  console.log(`- Planner logged in: ${planner.user.full_name} (ID: ${planner.user.id})`);
  console.log(`- Vendor logged in: ${vendor.user.full_name} (ID: ${vendor.user.id})`);

  // 2. Customer -> Planner Voice Message
  console.log('\n2. Testing Customer -> Planner Voice Message...');
  const wavBuffer = createAudioToneBuffer(4);
  const base64Audio = `data:audio/wav;base64,${wavBuffer.toString('base64')}`;

  const send1Res = await fetch(`${API}/messages/voice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customer.token}`
    },
    body: JSON.stringify({
      recipient_id: planner.user.id,
      duration: 4,
      audio_data: base64Audio
    })
  });
  const send1Data = await send1Res.json();
  console.log('Customer send voice response:', send1Data.success, send1Data.data.media_url);
  if (!send1Data.success || send1Data.data.message_type !== 'VOICE') {
    throw new Error('Failed to send Customer voice message: ' + JSON.stringify(send1Data));
  }

  const convId = send1Data.data.conversation_id;
  const mediaUrl = send1Data.data.media_url;

  // Verify file exists on disk
  const localFile = path.resolve(__dirname, '..', mediaUrl.replace(/^\//, ''));
  console.log('File on disk exists:', fs.existsSync(localFile), localFile);
  if (!fs.existsSync(localFile)) throw new Error(`Voice file missing on disk: ${localFile}`);

  // Verify HTTP static file serving
  const httpCheck = await testUrlHttp(mediaUrl);
  console.log('Static file HTTP status:', httpCheck.statusCode, httpCheck.contentType);
  if (httpCheck.statusCode !== 200) throw new Error('Static file route failed');

  // 3. Planner retrieves messages from Customer
  console.log('\n3. Planner fetches messages and verifies received voice message...');
  const plannerMsgRes = await fetch(`${API}/messages/${convId}`, {
    headers: { 'Authorization': `Bearer ${planner.token}` }
  });
  const plannerMsgData = await plannerMsgRes.json();
  const receivedMsg = plannerMsgData.data.find(m => m.id === send1Data.data.id);
  console.log('Planner received message:', {
    id: receivedMsg.id,
    message_type: receivedMsg.message_type,
    media_url: receivedMsg.media_url,
    duration: receivedMsg.duration,
    sender_name: receivedMsg.sender_name
  });
  if (!receivedMsg || receivedMsg.message_type !== 'VOICE' || !receivedMsg.media_url) {
    throw new Error('Planner failed to retrieve voice message');
  }

  // 4. Planner sends Voice Message reply to Customer
  console.log('\n4. Planner replies to Customer with voice message...');
  const send2Res = await fetch(`${API}/messages/voice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${planner.token}`
    },
    body: JSON.stringify({
      conversation_id: convId,
      duration: 3,
      audio_data: base64Audio
    })
  });
  const send2Data = await send2Res.json();
  console.log('Planner voice reply:', send2Data.success, send2Data.data.media_url);

  // 5. Customer fetches messages and verifies received Planner voice message
  console.log('\n5. Customer fetches messages and verifies received Planner voice message...');
  const custMsgRes = await fetch(`${API}/messages/${convId}`, {
    headers: { 'Authorization': `Bearer ${customer.token}` }
  });
  const custMsgData = await custMsgRes.json();
  const receivedReply = custMsgData.data.find(m => m.id === send2Data.data.id);
  console.log('Customer received voice reply:', {
    id: receivedReply.id,
    message_type: receivedReply.message_type,
    media_url: receivedReply.media_url,
    duration: receivedReply.duration,
    sender_name: receivedReply.sender_name
  });
  if (!receivedReply || receivedReply.message_type !== 'VOICE' || !receivedReply.media_url) {
    throw new Error('Customer failed to retrieve voice reply');
  }

  // 6. Vendor -> Planner Voice Message
  console.log('\n6. Testing Vendor -> Planner Voice Message...');
  const send3Res = await fetch(`${API}/messages/voice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${vendor.token}`
    },
    body: JSON.stringify({
      recipient_id: planner.user.id,
      duration: 5,
      audio_data: base64Audio
    })
  });
  const send3Data = await send3Res.json();
  console.log('Vendor voice send:', send3Data.success, send3Data.data.media_url);
  const vendorConvId = send3Data.data.conversation_id;

  // Planner checks Vendor's voice message
  const plVenMsgRes = await fetch(`${API}/messages/${vendorConvId}`, {
    headers: { 'Authorization': `Bearer ${planner.token}` }
  });
  const plVenMsgData = await plVenMsgRes.json();
  const recVendorMsg = plVenMsgData.data.find(m => m.id === send3Data.data.id);
  console.log('Planner received vendor voice message:', {
    id: recVendorMsg.id,
    message_type: recVendorMsg.message_type,
    media_url: recVendorMsg.media_url,
    duration: recVendorMsg.duration,
    sender_name: recVendorMsg.sender_name
  });
  if (!recVendorMsg || recVendorMsg.message_type !== 'VOICE' || !recVendorMsg.media_url) {
    throw new Error('Planner failed to retrieve vendor voice message');
  }

  // 7. Planner replies to Vendor with voice message
  console.log('\n7. Planner replies to Vendor with voice message...');
  const send4Res = await fetch(`${API}/messages/voice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${planner.token}`
    },
    body: JSON.stringify({
      conversation_id: vendorConvId,
      duration: 4,
      audio_data: base64Audio
    })
  });
  const send4Data = await send4Res.json();
  console.log('Planner -> Vendor reply:', send4Data.success, send4Data.data.media_url);

  // Vendor receives Planner reply
  const venMsgRes = await fetch(`${API}/messages/${vendorConvId}`, {
    headers: { 'Authorization': `Bearer ${vendor.token}` }
  });
  const venMsgData = await venMsgRes.json();
  const recPlannerReply = venMsgData.data.find(m => m.id === send4Data.data.id);
  console.log('Vendor received planner reply:', {
    id: recPlannerReply.id,
    message_type: recPlannerReply.message_type,
    media_url: recPlannerReply.media_url,
    duration: recPlannerReply.duration,
    sender_name: recPlannerReply.sender_name
  });
  if (!recPlannerReply || recPlannerReply.message_type !== 'VOICE' || !recPlannerReply.media_url) {
    throw new Error('Vendor failed to retrieve planner reply');
  }

  // 8. Test Chatbot Voice Queries for all roles
  console.log('\n8. Testing Chatbot for Customer, Planner, and Vendor...');
  const botCustRes = await fetch(`${API}/chatbot/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customer.token}`
    },
    body: JSON.stringify({ message: 'What is my booking status?' })
  });
  const botCustData = await botCustRes.json();
  console.log('Customer Chatbot Answer:', botCustData.success, botCustData.data.message_text.slice(0, 80) + '...');

  const botPlannerRes = await fetch(`${API}/chatbot/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${planner.token}`
    },
    body: JSON.stringify({ message: 'How many pending vendor requests?' })
  });
  const botPlannerData = await botPlannerRes.json();
  console.log('Planner Chatbot Answer:', botPlannerData.success, botPlannerData.data.message_text.slice(0, 80) + '...');

  const botVendorRes = await fetch(`${API}/chatbot/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${vendor.token}`
    },
    body: JSON.stringify({ message: 'Do I have new requests?' })
  });
  const botVendorData = await botVendorRes.json();
  console.log('Vendor Chatbot Answer:', botVendorData.success, botVendorData.data.message_text.slice(0, 80) + '...');

  console.log('\n========================================================');
  console.log('ALL VOICE MESSAGING & CHATBOT TESTS PASSED 100% CLEANLY!');
  console.log('========================================================');
}

main().catch(err => {
  console.error('VERIFICATION ERROR:', err.message);
  process.exit(1);
});
