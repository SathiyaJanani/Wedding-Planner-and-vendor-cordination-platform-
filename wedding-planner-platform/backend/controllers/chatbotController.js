const { query } = require('../config/db');

async function handleChatbotMessage(req, res) {
  try {
    const { message, session_token } = req.body;
    const user = req.user;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message cannot be empty.' });
    }

    const cleanMsg = message.trim();
    const token = session_token || `sess_${user.id}_${Date.now()}`;

    // 1. Get or create chatbot_conversations record
    let conversationId;
    const [cRows] = await query(
      'SELECT id FROM chatbot_conversations WHERE user_id = ? AND session_token = ?',
      [user.id, token]
    );

    if (cRows.length > 0) {
      conversationId = cRows[0].id;
    } else {
      const [insertConv] = await query(
        `INSERT INTO chatbot_conversations (user_id, session_token, title)
         VALUES (?, ?, ?)`,
        [user.id, token, `${user.role_name} Assistant Session`]
      );
      conversationId = insertConv.insertId;
    }

    // 2. Save User message to chatbot_messages
    await query(
      `INSERT INTO chatbot_messages (conversation_id, sender, message_text)
       VALUES (?, 'USER', ?)`,
      [conversationId, cleanMsg]
    );

    // 3. Process message based on user role and real database state
    let botResponse = '';
    const lower = cleanMsg.toLowerCase();

    // =========================================================================
    // ROLE: CUSTOMER
    // =========================================================================
    if (user.role_name === 'CUSTOMER') {
      const customerId = user.customer_id;

      // Fetch customer wedding details & project
      const [projectRows] = await query(
        `SELECT wp.*, c.partner_name, c.wedding_date AS cust_wedding_date, c.estimated_budget AS cust_budget,
                p.agency_name AS planner_agency, pu.full_name AS planner_name, pu.phone AS planner_phone, pu.email AS planner_email,
                b.id AS booking_id, b.status AS booking_status, b.total_amount AS booking_total, b.paid_amount AS booking_paid
         FROM customers c
         LEFT JOIN wedding_projects wp ON wp.customer_id = c.id
         LEFT JOIN planners p ON c.planner_id = p.id
         LEFT JOIN users pu ON p.user_id = pu.id
         LEFT JOIN bookings b ON b.wedding_project_id = wp.id
         WHERE c.id = ?`,
        [customerId]
      );

      const project = projectRows.length > 0 ? projectRows[0] : null;

      if (lower.includes('submit') || lower.includes('requirement')) {
        botResponse = `To submit your wedding requirements, navigate to "Wedding Requirements" in the sidebar menu. Enter your wedding date, venue preference, expected guest count, total budget, and choose from our 16 service categories (Hall, Decor, Catering, Photography, etc.). Once submitted, your Wedding Planner will review it and assemble your project!`;
      } else if (lower.includes('booking status') || lower.includes('status of my booking')) {
        if (!project || !project.booking_status) {
          botResponse = `You currently do not have an active booking. Please submit your wedding requirements to initiate the planning process.`;
        } else {
          botResponse = `Your current wedding booking status for "${project.title || 'Wedding Project'}" is **${project.booking_status}**. Total contracted value: ₹${Number(project.booking_total || 0).toLocaleString('en-IN')}, with ₹${Number(project.booking_paid || 0).toLocaleString('en-IN')} paid to date.`;
        }
      } else if (lower.includes('how can i make a payment') || lower.includes('make a payment') || lower.includes('how to pay')) {
        botResponse = `To make a milestone payment:
1. Navigate to the **Payments** tab in your sidebar.
2. Review your 3 milestone installments: **Advance (30%)**, **Second Payment (40%)**, and **Final Settlement (30%)**.
3. Click the **"Pay Milestone"** button on the active installment.
4. Select your preferred payment method (**UPI**, **Card**, or **NetBanking** on our Secure Mock Simulator) and confirm.
5. Your payment receipt and synchronized budget tracker will update immediately!`;
      } else if (lower.includes('support ticket') || lower.includes('ticket status') || lower.includes('support status')) {
        const [tickets] = await query(
          `SELECT ticket_number, subject, priority, status, resolution_notes, created_at 
           FROM support_requests 
           WHERE user_id = ? 
           ORDER BY created_at DESC LIMIT 3`,
          [user.id]
        );
        if (tickets.length === 0) {
          botResponse = `You currently have no active support tickets. If you need any assistance, you can open a ticket under the **Support Desk** menu.`;
        } else {
          const list = tickets.map(t => `- **${t.ticket_number}** ("${t.subject}"): **${t.status}** [Priority: ${t.priority}]${t.resolution_notes ? `\n  *Response:* "${t.resolution_notes}"` : ''}`).join('\n');
          botResponse = `**Your Recent Support Tickets:**\n${list}\n\nYou can track and reply to tickets on the **Support Desk** page.`;
        }
      } else if (lower.includes('how much is pending') || lower.includes('how much have i paid') || lower.includes('paid') || lower.includes('payment') || lower.includes('balance')) {
        if (!project || !project.booking_id) {
          botResponse = `No payment records found yet. Once your planner proposes vendors and you approve them, your milestone payment schedule (Advance, Second, Final) will activate.`;
        } else {
          const [payments] = await query('SELECT title, milestone_name, amount, status FROM payments WHERE booking_id = ?', [project.booking_id]);
          const paidSum = payments.filter(p => p.status === 'SUCCESS').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
          const pendingSum = payments.filter(p => p.status === 'PENDING').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

          botResponse = `**Payment Summary:**\n- **Amount Paid:** ₹${paidSum.toLocaleString('en-IN')}\n- **Pending Balance:** ₹${pendingSum.toLocaleString('en-IN')}\n- **Total Contract:** ₹${Number(project.booking_total || 0).toLocaleString('en-IN')}\n\nYou can view and pay your milestones under the **Payments** tab.`;
        }
      } else if (lower.includes('vendor') || lower.includes('selected') || lower.includes('arranged')) {
        if (!project || !project.booking_id) {
          botResponse = `Vendors have not been arranged yet. Once your wedding requirements are converted into a project, your planner will select and coordinate vendors for you.`;
        } else {
          const [services] = await query(
            `SELECT bs.service_name, bs.category_name, bs.agreed_price, bs.paid_amount, bs.status, v.business_name
             FROM booking_services bs
             JOIN vendors v ON bs.vendor_id = v.id
             WHERE bs.booking_id = ?`,
            [project.booking_id]
          );

          if (services.length === 0) {
            botResponse = `Your Wedding Planner is currently in discussions with vendors. As soon as vendors accept requests, they will appear under your "Vendor Selection" tab for your approval.`;
          } else {
            const list = services.map(s => `- **${s.business_name}** (${s.category_name}): ₹${Number(s.agreed_price).toLocaleString('en-IN')} (Paid: ₹${Number(s.paid_amount || 0).toLocaleString('en-IN')}) [${s.status}]`).join('\n');
            botResponse = `Here are the vendors arranged for your wedding:\n${list}\n\nYou can approve or request changes on the **Vendor Selection** page!`;
          }
        }
      } else if (lower.includes('budget') || lower.includes('remaining budget')) {
        if (!project) {
          botResponse = `Your estimated target budget is ₹${Number(user.estimated_budget || 1000000).toLocaleString('en-IN')}. Submit your requirements to unlock the live Budget Tracker.`;
        } else {
          const [bData] = await query('SELECT * FROM budgets WHERE wedding_project_id = ?', [project.id]);
          if (bData.length > 0) {
            const b = bData[0];
            botResponse = `**Live Budget Overview:**\n- **Total Budget:** ₹${Number(b.total_budget).toLocaleString('en-IN')}\n- **Allocated / Contracted:** ₹${Number(b.allocated_amount).toLocaleString('en-IN')}\n- **Paid Out:** ₹${Number(b.spent_amount).toLocaleString('en-IN')}\n- **Remaining Budget:** ₹${Number(b.remaining_amount).toLocaleString('en-IN')}`;
          } else {
            botResponse = `Your wedding project budget is ₹${Number(project.total_budget).toLocaleString('en-IN')}.`;
          }
        }
      } else if (lower.includes('when is my wedding') || lower.includes('wedding date')) {
        const date = (project && project.wedding_date) || user.wedding_date || 'Not set';
        botResponse = `Your scheduled wedding date is **${date}**. You can track your day-of itinerary under the **Wedding Schedule** section!`;
      } else if (lower.includes('contact') || lower.includes('planner')) {
        if (project && project.planner_name) {
          botResponse = `Your designated Wedding Planner is **${project.planner_name}** (${project.planner_agency || 'Lead Wedding Director'}).\n- **Phone:** ${project.planner_phone || '+91 98765 43210'}\n- **Email:** ${project.planner_email || 'planner@wedding.com'}\n\nYou can also chat with them directly using the in-app **Messages** tab!`;
        } else {
          botResponse = `Your assigned wedding coordination agency is **Vows & Veils Signature Weddings**. You can send messages to them anytime using the in-app **Messages** page.`;
        }
      } else {
        botResponse = `Hello ${user.full_name}! As your Wedding Assistant, I can help you with:\n1. Checking your **wedding date**\n2. Viewing your **booking status** & **service amounts**\n3. Checking **how much you have paid** & **pending balance**\n4. Reviewing **selected vendors**\n5. Checking your **remaining budget**\n6. How to **make a payment**\n7. Checking your **support ticket status**\n8. Contacting your **Wedding Planner**\n\nWhat would you like to know?`;
      }

    // =========================================================================
    // ROLE: PLANNER
    // =========================================================================
    } else if (user.role_name === 'PLANNER') {

      if (lower.includes('pending payment') || lower.includes('payments are pending') || lower.includes('which payments are pending')) {
        const [pPays] = await query(
          `SELECT p.payment_code, p.title, p.milestone_name, p.amount, p.due_date, wp.title AS project_title, cu.full_name AS customer_name
           FROM payments p
           JOIN wedding_projects wp ON p.wedding_project_id = wp.id
           JOIN customers c ON p.customer_id = c.id
           JOIN users cu ON c.user_id = cu.id
           WHERE p.status = 'PENDING'
           ORDER BY p.due_date ASC LIMIT 5`
        );
        if (pPays.length === 0) {
          botResponse = `All milestone payments across your wedding projects have been settled! No pending payments at this moment.`;
        } else {
          const list = pPays.map(p => `- **${p.payment_code}** (${p.project_title}): ₹${Number(p.amount).toLocaleString('en-IN')} due ${p.due_date} from ${p.customer_name} [${p.milestone_name}]`).join('\n');
          botResponse = `**Pending Milestone Payments (${pPays.length} upcoming):**\n${list}\n\nView and manage them under the **Payments** tab.`;
        }
      } else if (lower.includes('pending') || lower.includes('vendor request')) {
        const [pReqs] = await query(
          `SELECT vr.request_code, vr.event_date, v.business_name, sc.name AS category_name, wp.title AS project_title
           FROM vendor_requests vr
           JOIN vendors v ON vr.vendor_id = v.id
           JOIN service_categories sc ON v.category_id = sc.id
           JOIN wedding_projects wp ON vr.wedding_project_id = wp.id
           WHERE vr.status = 'PENDING'`
        );

        if (pReqs.length === 0) {
          botResponse = `You have no pending vendor requests right now. All requests have been addressed!`;
        } else {
          const list = pReqs.map(r => `- **${r.request_code}**: ${r.business_name} (${r.category_name}) for ${r.project_title} on ${r.event_date}`).join('\n');
          botResponse = `You currently have **${pReqs.length} pending vendor request(s)**:\n${list}\n\nCheck **Vendor Requests** in navigation to follow up or reassign.`;
        }
      } else if (lower.includes('available') || lower.includes('availability') || lower.includes('which vendors are available')) {
        const [cats] = await query('SELECT name, (SELECT COUNT(*) FROM vendors WHERE category_id = service_categories.id) AS count FROM service_categories LIMIT 6');
        const catList = cats.map(c => `- **${c.name}**: ${c.count} verified vendor(s)`).join('\n');
        botResponse = `To check exact vendor availability for a wedding date and time slot, use the **Vendor Availability** tool in your navigation. We have verified vendors across all categories:\n${catList}`;
      } else if (lower.includes('confirmed') || lower.includes('booking')) {
        const [cBookings] = await query(
          `SELECT b.booking_code, b.total_amount, b.status, wp.title, wp.wedding_date
           FROM bookings b
           JOIN wedding_projects wp ON b.wedding_project_id = wp.id
           WHERE b.status IN ('CONFIRMED', 'FULLY_PAID', 'PARTIALLY_PAID')`
        );
        const list = cBookings.map(b => `- **${b.booking_code}** (${b.title}): ₹${Number(b.total_amount).toLocaleString('en-IN')} on ${b.wedding_date} [${b.status}]`).join('\n');
        botResponse = `There are **${cBookings.length} active/confirmed booking(s)**:\n${list || 'None yet.'}`;
      } else if (lower.includes('upcoming') || lower.includes('weddings')) {
        const [up] = await query(
          `SELECT project_code, title, wedding_date, city, total_budget, status
           FROM wedding_projects
           WHERE wedding_date >= CURRENT_DATE
           ORDER BY wedding_date ASC LIMIT 5`
        );
        const list = up.map(w => `- **${w.wedding_date}**: ${w.title} (${w.city}) - Budget: ₹${Number(w.total_budget).toLocaleString('en-IN')} [${w.status}]`).join('\n');
        botResponse = `**Upcoming Weddings:**\n${list || 'No upcoming weddings scheduled.'}`;
      } else if (lower.includes('requirement') || lower.includes('customer request')) {
        const [reqs] = await query(
          `SELECT wr.id, wr.wedding_date, wr.location, wr.estimated_budget, u.full_name
           FROM wedding_requirements wr
           JOIN customers c ON wr.customer_id = c.id
           JOIN users u ON c.user_id = u.id
           WHERE wr.status = 'SUBMITTED'`
        );
        botResponse = `There are **${reqs.length} new customer requirement(s)** awaiting conversion to wedding projects. Review them under **Customer Requests**.`;
      } else {
        const [counts] = await query(`
          SELECT 
            (SELECT COUNT(*) FROM customers) AS customers_count,
            (SELECT COUNT(*) FROM wedding_projects WHERE status != 'COMPLETED') AS active_weddings,
            (SELECT COUNT(*) FROM vendor_requests WHERE status = 'PENDING') AS pending_requests,
            (SELECT COUNT(*) FROM payments WHERE status = 'PENDING') AS pending_payments
        `);
        const c = counts[0];
        botResponse = `Greetings Planner! Here is your quick system overview:\n- **Total Customers:** ${c.customers_count}\n- **Active Weddings:** ${c.active_weddings}\n- **Pending Vendor Requests:** ${c.pending_requests}\n- **Pending Milestone Payments:** ${c.pending_payments}\n\nYou can ask me about:\n- How many **pending vendor requests**\n- Which **vendors are available**\n- How many **confirmed bookings**\n- Which **payments are pending**\n- **Upcoming weddings**\n- **Customer requirements**`;
      }

    // =========================================================================
    // ROLE: VENDOR
    // =========================================================================
    } else if (user.role_name === 'VENDOR') {
      const vendorId = user.vendor_id;

      if (lower.includes('accepted booking') || lower.includes('accepted bookings')) {
        const [accepted] = await query(
          `SELECT vr.request_code, vr.event_date, vr.proposed_price, wp.title AS project_title, pu.full_name AS planner_name
           FROM vendor_requests vr
           JOIN wedding_projects wp ON vr.wedding_project_id = wp.id
           JOIN planners p ON vr.planner_id = p.id
           JOIN users pu ON p.user_id = pu.id
           WHERE vr.vendor_id = ? AND vr.status = 'ACCEPTED'
           ORDER BY vr.event_date ASC LIMIT 5`,
          [vendorId]
        );
        if (accepted.length === 0) {
          botResponse = `You have not accepted any pending bookings yet. Check **Booking Requests** to view new planner invitations.`;
        } else {
          const list = accepted.map(a => `- **${a.request_code}**: ${a.project_title} on ${a.event_date} (Agreed: ₹${Number(a.proposed_price).toLocaleString('en-IN')}) via Planner ${a.planner_name}`).join('\n');
          botResponse = `**Your Accepted Engagements (${accepted.length}):**\n${list}\n\nThese will move to CONFIRMED once the customer settles the milestone.`;
        }
      } else if (lower.includes('availability') || lower.includes('my availability')) {
        const [avail] = await query(
          `SELECT date, status, reason FROM vendor_availability 
           WHERE vendor_id = ? AND date >= CURRENT_DATE 
           ORDER BY date ASC LIMIT 5`,
          [vendorId]
        );
        if (avail.length === 0) {
          botResponse = `Your availability calendar is open for upcoming dates. You can mark specific dates as UNAVAILABLE or custom hours on **My Availability**.`;
        } else {
          const list = avail.map(a => `- **${a.date}**: **${a.status}** ${a.reason ? `(${a.reason})` : ''}`).join('\n');
          botResponse = `**Upcoming Calendar Slots:**\n${list}\n\nUpdate your dates in **Availability Calendar**.`;
        }
      } else if (lower.includes('new request') || lower.includes('booking request') || lower.includes('requests')) {
        const [requests] = await query(
          `SELECT vr.request_code, vr.event_date, vr.proposed_price, wp.title AS project_title, pu.full_name AS planner_name
           FROM vendor_requests vr
           JOIN wedding_projects wp ON vr.wedding_project_id = wp.id
           JOIN planners p ON vr.planner_id = p.id
           JOIN users pu ON p.user_id = pu.id
           WHERE vr.vendor_id = ? AND vr.status = 'PENDING'`,
          [vendorId]
        );

        if (requests.length === 0) {
          botResponse = `You have no pending requests right now. Great job keeping your booking queue up to date!`;
        } else {
          const list = requests.map(r => `- **${r.request_code}**: ${r.project_title} on **${r.event_date}** (Offer: ₹${Number(r.proposed_price).toLocaleString('en-IN')}) from Planner ${r.planner_name}`).join('\n');
          botResponse = `You have **${requests.length} new booking request(s)** pending your response:\n${list}\n\nPlease head to **Booking Requests** to Accept or Decline (with reason).`;
        }
      } else if (lower.includes('upcoming') || lower.includes('booking') || lower.includes('schedule')) {
        const [bookings] = await query(
          `SELECT bs.service_name, bs.agreed_price, wp.title AS project_title, wp.wedding_date, wp.venue_name, wp.city
           FROM booking_services bs
           JOIN bookings b ON bs.booking_id = b.id
           JOIN wedding_projects wp ON b.wedding_project_id = wp.id
           WHERE bs.vendor_id = ? AND bs.status IN ('CONFIRMED', 'CUSTOMER_APPROVED')
           ORDER BY wp.wedding_date ASC LIMIT 5`,
          [vendorId]
        );

        if (bookings.length === 0) {
          botResponse = `You do not have any confirmed upcoming bookings yet. Keep your availability updated on your calendar!`;
        } else {
          const list = bookings.map(b => `- **${b.wedding_date}**: ${b.project_title} (${b.venue_name || b.city}) - ₹${Number(b.agreed_price).toLocaleString('en-IN')}`).join('\n');
          botResponse = `**Your Upcoming Engagements:**\n${list}\n\nView details in **My Schedule**.`;
        }
      } else if (lower.includes('payment') || lower.includes('earnings') || lower.includes('pending payment')) {
        const [earnings] = await query(
          `SELECT SUM(bs.agreed_price) AS total_contracted, SUM(bs.paid_amount) AS total_paid
           FROM booking_services bs
           WHERE bs.vendor_id = ?`,
          [vendorId]
        );
        const total = earnings[0].total_contracted || 0;
        const paid = earnings[0].total_paid || 0;
        const pending = Math.max(0, total - paid);
        botResponse = `**Earnings Snapshot:**\n- **Total Contracted:** ₹${Number(total).toLocaleString('en-IN')}\n- **Disbursed / Paid:** ₹${Number(paid).toLocaleString('en-IN')}\n- **Pending Milestone Releases:** ₹${Number(pending).toLocaleString('en-IN')}\n\nYou can track releases and download invoices under the **Payments** and **Invoices** tabs.`;
      } else if (lower.includes('review') || lower.includes('rating')) {
        const [reviews] = await query(
          `SELECT r.rating, r.review_text, u.full_name AS customer_name
           FROM reviews r
           JOIN customers c ON r.customer_id = c.id
           JOIN users u ON c.user_id = u.id
           WHERE r.vendor_id = ?
           ORDER BY r.created_at DESC LIMIT 3`,
          [vendorId]
        );

        if (reviews.length === 0) {
          botResponse = `No reviews have been posted for your services yet. Complete wedding milestones to start receiving client ratings!`;
        } else {
          const list = reviews.map(r => `- ${'⭐'.repeat(r.rating)} by **${r.customer_name}**: "${r.review_text}"`).join('\n');
          botResponse = `**Recent Customer Reviews:**\n${list}\n\nYou can view and reply to reviews under **Reviews & Ratings**.`;
        }
      } else {
        botResponse = `Hello ${user.full_name}! As your Vendor Operations Assistant, I can help you with:\n1. Checking **new requests**\n2. Viewing your **upcoming bookings & schedule**\n3. Checking **pending payments & earnings**\n4. Reviewing your **availability**\n5. Checking **accepted bookings**\n6. Viewing **recent customer reviews**\n\nHow can I help you today?`;
      }
    }

    // 4. Save Bot response to chatbot_messages
    await query(
      `INSERT INTO chatbot_messages (conversation_id, sender, message_text)
       VALUES (?, 'BOT', ?)`,
      [conversationId, botResponse]
    );

    return res.json({
      success: true,
      session_token: token,
      data: {
        sender: 'BOT',
        message_text: botResponse,
        created_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[handleChatbotMessage Error]:', error);
    return res.status(500).json({ success: false, message: 'Chatbot processing failed.' });
  }
}

// Get chatbot conversation history
async function getChatbotHistory(req, res) {
  try {
    const { session_token } = req.query;
    const userId = req.user.id;

    let sql = `
      SELECT cm.*
      FROM chatbot_messages cm
      JOIN chatbot_conversations cc ON cm.conversation_id = cc.id
      WHERE cc.user_id = ?
    `;
    const params = [userId];

    if (session_token) {
      sql += ` AND cc.session_token = ?`;
      params.push(session_token);
    }

    sql += ` ORDER BY cm.created_at ASC LIMIT 100`;

    const [rows] = await query(sql, params);
    return res.json({ success: true, count: rows.length, data: rows });

  } catch (error) {
    console.error('[getChatbotHistory Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve chatbot history.' });
  }
}

module.exports = {
  handleChatbotMessage,
  getChatbotHistory
};
