const { query } = require('../config/db');

async function seedConversations() {
  try {
    console.log('--- Ensuring Project Conversations for All Real Accounts ---');

    // Planner ID is 6 (sathiyajani1112@gmail.com)
    const plannerId = 6;

    const initialThreads = [
      {
        projectId: 1, // Barani & Anita
        otherUserId: 12, // Grand Palace (grandpalace@vendor.com)
        plannerMsg: 'Hello Sanjay, can you please verify the heritage lawn setup for the Barani & Anita reception on Nov 20?',
        vendorMsg: 'Hello Priya, yes! The outdoor lawns and banquet hall are reserved and ready for staging.'
      },
      {
        projectId: 1, // Barani & Anita
        otherUserId: 18, // Floral (floral@vendor.com)
        plannerMsg: 'Hi Ananya, please confirm the floral canopy and mandap arrangement colors.',
        vendorMsg: 'Hi Priya, we have prepared the pastel marigold and orchid sample palettes.'
      },
      {
        projectId: 1, // Barani & Anita
        otherUserId: 27, // Glamour (glamour@vendor.com)
        plannerMsg: 'Hi Kavita, the bridal makeup call time is confirmed for 5:30 AM at the venue suite.',
        vendorMsg: 'Thank you Priya, our senior artist team will be on site with the airbrush equipment.'
      },
      {
        projectId: 2, // Malini & Sneha
        otherUserId: 8, // Customer Malini (malini@gmail.com)
        plannerMsg: 'Dear Malini, the pastel bohemian theme design board has been updated with the florist.',
        vendorMsg: 'Thank you Priya! Sneha and I reviewed it, and we absolutely love the lavender theme.'
      },
      {
        projectId: 2, // Malini & Sneha
        otherUserId: 48, // DJ Beats (djbeats@vendor.com)
        plannerMsg: 'Hi Rohit, could you send the tracklist draft for the Sangeet evening?',
        vendorMsg: 'Hi Priya! Sending the Bollywood-EDM playlist over this evening.'
      },
      {
        projectId: 3, // Loha & Pooja
        otherUserId: 9, // Customer Loha (loha@gmail.com)
        plannerMsg: 'Dear Loha, we have coordinated with the temple trust for the muhurtham schedule on Dec 18.',
        vendorMsg: 'Great news Priya! My parents are very pleased with the priest arrangements.'
      },
      {
        projectId: 4, // Ranjani & Meera
        otherUserId: 10, // Customer Ranjani (ranjani@gmail.com)
        plannerMsg: 'Hi Ranjani, the minimalist decor mockups are ready in your documents tab.',
        vendorMsg: 'Hi Priya, the geometric arch design looks stunning!'
      },
      {
        projectId: 4, // Ranjani & Meera
        otherUserId: 15, // Royal Catering (royalcatering@vendor.com)
        plannerMsg: 'Chef Rajesh, please confirm the 300 pax traditional South Indian buffet menu for Jan 15.',
        vendorMsg: 'Confirmed Priya, our 24-dish traditional banana leaf banquet plan is locked.'
      },
      {
        projectId: 5, // Siva & Deepika
        otherUserId: 11, // Customer Siva (siva@gmail.com)
        plannerMsg: 'Hello Siva! Welcome to Vows & Veils. We have initiated vendor sourcing for your Bollywood Extravaganza.',
        vendorMsg: 'Awesome, looking forward to creating something unforgettable for Deepika!'
      }
    ];

    for (const t of initialThreads) {
      // Check if conversation already exists between planner and otherUserId
      const [existing] = await query(
        `SELECT id FROM conversations 
         WHERE (participant_one_id = ? AND participant_two_id = ?)
            OR (participant_one_id = ? AND participant_two_id = ?)`,
        [plannerId, t.otherUserId, t.otherUserId, plannerId]
      );

      let convId;
      if (existing.length > 0) {
        convId = existing[0].id;
        console.log(`Thread exists (Conv #${convId}) between Planner (6) & User (${t.otherUserId})`);
      } else {
        const [cRes] = await query(
          `INSERT INTO conversations (wedding_project_id, participant_one_id, participant_two_id, last_message_at)
           VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
          [t.projectId, plannerId, t.otherUserId]
        );
        convId = cRes.insertId;
        console.log(`Created Thread (Conv #${convId}) between Planner (6) & User (${t.otherUserId})`);

        // Add initial 2 messages
        await query(
          `INSERT INTO messages (conversation_id, sender_id, recipient_id, message_text, is_read, created_at)
           VALUES (?, ?, ?, ?, TRUE, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 2 HOUR))`,
          [convId, plannerId, t.otherUserId, t.plannerMsg]
        );

        await query(
          `INSERT INTO messages (conversation_id, sender_id, recipient_id, message_text, is_read, created_at)
           VALUES (?, ?, ?, ?, FALSE, CURRENT_TIMESTAMP)`,
          [convId, t.otherUserId, plannerId, t.vendorMsg]
        );

        // Add notification for recipient
        await query(
          `INSERT INTO notifications (user_id, title, message, notification_type, reference_id, reference_type, is_read)
           VALUES (?, ?, ?, 'MESSAGE', ?, 'conversation', FALSE)`,
          [plannerId, 'New coordination message', t.vendorMsg.substring(0, 80), convId]
        );
      }
    }

    const [totalConv] = await query('SELECT COUNT(*) as cnt FROM conversations');
    const [totalMsg] = await query('SELECT COUNT(*) as cnt FROM messages');
    console.log(`Total conversations now: ${totalConv[0].cnt}, Total messages: ${totalMsg[0].cnt}`);
    console.log('--- Successfully seeded real conversations! ---');
    process.exit(0);
  } catch (error) {
    console.error('Seed conversations error:', error);
    process.exit(1);
  }
}

seedConversations();
