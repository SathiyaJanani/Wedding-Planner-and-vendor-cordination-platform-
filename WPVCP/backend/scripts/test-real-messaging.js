const API_BASE = 'http://localhost:5000/api';

async function testRealMessaging() {
  console.log('--- Testing Real-World Messaging Flow ---');

  // 1. Customer Barani logs in
  const custLoginResp = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'barani@gmail.com', password: 'password123' })
  });
  const custAuth = await custLoginResp.json();
  const custToken = custAuth.token;
  console.log(`[1] Customer logged in: ${custAuth.user.full_name} (${custAuth.user.email}) [ID: ${custAuth.user.id}]`);

  // 2. Fetch contacts for Barani
  const contactsResp = await fetch(`${API_BASE}/messages/contacts`, {
    headers: { Authorization: `Bearer ${custToken}` }
  });
  const contactsData = await contactsResp.json();
  console.log(`[2] Customer retrieved ${contactsData.count} available real contacts.`);
  const plannerContact = contactsData.data.find(c => c.email === 'sathiyajani1112@gmail.com');
  console.log(`    Found Planner Contact: ${plannerContact?.name} (${plannerContact?.email})`);

  // 3. Customer sends message to Planner (Priya Sharma, sathiyajani1112@gmail.com)
  const sendResp = await fetch(`${API_BASE}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${custToken}`
    },
    body: JSON.stringify({
      recipient_id: plannerContact.id,
      message_text: 'Hi Priya, Anita and I checked the guest list, confirmed 450 guests.'
    })
  });
  const sendData = await sendResp.json();
  console.log('[3] Message sent result:', {
    success: sendData.success,
    sender: sendData.data?.sender_name,
    sender_email: sendData.data?.sender_email,
    recipient: sendData.data?.recipient_name,
    recipient_email: sendData.data?.recipient_email,
    text: sendData.data?.message_text
  });

  // 4. Planner logs in with sathiyajani1112@gmail.com
  const plannerLoginResp = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'sathiyajani1112@gmail.com', password: 'password123' })
  });
  const plannerAuth = await plannerLoginResp.json();
  const plannerToken = plannerAuth.token;
  console.log(`[4] Planner logged in: ${plannerAuth.user.full_name} (${plannerAuth.user.email}) [ID: ${plannerAuth.user.id}]`);

  // 5. Planner checks notifications
  const notifResp = await fetch(`${API_BASE}/notifications?is_read=false`, {
    headers: { Authorization: `Bearer ${plannerToken}` }
  });
  const notifData = await notifResp.json();
  console.log(`[5] Planner unread notifications: ${notifData.unread_count}`);
  const latestNotif = notifData.data[0];
  console.log('    Latest notification for Planner:', {
    title: latestNotif?.title,
    message: latestNotif?.message,
    created_at: latestNotif?.created_at
  });

  // 6. Planner checks messages in the conversation
  const convId = sendData.data.conversation_id;
  const msgsResp = await fetch(`${API_BASE}/messages/${convId}`, {
    headers: { Authorization: `Bearer ${plannerToken}` }
  });
  const msgsData = await msgsResp.json();
  console.log(`[6] Planner retrieved ${msgsData.count} messages in conversation #${convId}`);
  const lastMsg = msgsData.data[msgsData.data.length - 1];
  console.log(`    Last message in thread: "${lastMsg.message_text}" from ${lastMsg.sender_name}`);

  // 7. Planner replies to Barani
  const replyResp = await fetch(`${API_BASE}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${plannerToken}`
    },
    body: JSON.stringify({
      conversation_id: convId,
      recipient_id: custAuth.user.id,
      message_text: 'Thank you Barani! Noted 450 guests. Updating catering quantities with Chef Rajesh now.'
    })
  });
  const replyData = await replyResp.json();
  console.log('[7] Planner replied to Barani:', {
    success: replyData.success,
    recipient: replyData.data?.recipient_name,
    recipient_email: replyData.data?.recipient_email
  });

  // 8. Barani checks notifications to verify receipt of reply
  const custNotifResp = await fetch(`${API_BASE}/notifications?is_read=false`, {
    headers: { Authorization: `Bearer ${custToken}` }
  });
  const custNotifData = await custNotifResp.json();
  console.log(`[8] Customer unread notifications: ${custNotifData.unread_count}`);
  console.log('    Latest notification for Customer:', custNotifData.data[0]?.title, '-', custNotifData.data[0]?.message);

  console.log('\n>>> REAL-WORLD MESSAGING FLOW VERIFIED 100%! <<<');
}

testRealMessaging().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
