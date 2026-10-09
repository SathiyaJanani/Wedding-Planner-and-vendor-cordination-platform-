const { query } = require('../config/db');
const { createNotification } = require('../services/notificationService');
const { parsePagination, buildPaginationResponse, buildOrderBy } = require('../utils/queryHelper');

// Get all payments (Planner view)
async function getAllPayments(req, res) {
  try {
    const { status, customer_id, booking_id, search, sort_by } = req.query;
    const { page, limit, offset, isExplicit } = parsePagination(req.query, 10, 100);

    let baseFromWhere = `
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN wedding_projects wp ON p.wedding_project_id = wp.id
      JOIN customers c ON p.customer_id = c.id
      JOIN users cu ON c.user_id = cu.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      baseFromWhere += ` AND p.status = ?`;
      params.push(status);
    }

    if (customer_id) {
      baseFromWhere += ` AND p.customer_id = ?`;
      params.push(customer_id);
    }

    if (booking_id) {
      baseFromWhere += ` AND p.booking_id = ?`;
      params.push(booking_id);
    }

    if (search) {
      baseFromWhere += ` AND (p.payment_code LIKE ? OR p.title LIKE ? OR cu.full_name LIKE ? OR wp.title LIKE ? OR b.booking_code LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }

    // 1. Total count
    const [countRows] = await query(`SELECT COUNT(*) AS total ${baseFromWhere}`, params);
    const totalCount = countRows[0]?.total || 0;

    // 2. Sorting
    const sortMap = {
      due_date_asc: 'p.due_date ASC',
      due_date_desc: 'p.due_date DESC',
      amount_desc: 'p.amount DESC',
      amount_asc: 'p.amount ASC',
      newest: 'p.id DESC'
    };
    const orderClause = buildOrderBy(sort_by, sortMap, 'p.due_date ASC');

    // 3. Selection query
    let selectSql = `
      SELECT p.*,
             b.booking_code, b.total_amount AS booking_total, b.paid_amount AS booking_paid_amount, b.status AS booking_status,
             wp.project_code, wp.title AS project_title, wp.wedding_date,
             c.partner_name, cu.full_name AS customer_name, cu.email AS customer_email, cu.phone AS customer_phone,
             (SELECT transaction_reference FROM payment_transactions WHERE payment_id = p.id ORDER BY id DESC LIMIT 1) AS transaction_reference,
             (SELECT payment_method FROM payment_transactions WHERE payment_id = p.id ORDER BY id DESC LIMIT 1) AS payment_method,
             (SELECT paid_at FROM payment_transactions WHERE payment_id = p.id ORDER BY id DESC LIMIT 1) AS paid_at
      ${baseFromWhere}
      ${orderClause}
    `;

    let rows;
    if (isExplicit) {
      selectSql += ` LIMIT ? OFFSET ?`;
      [rows] = await query(selectSql, [...params, limit, offset]);
    } else {
      [rows] = await query(selectSql, params);
    }

    return res.json(buildPaginationResponse(rows, totalCount, page, isExplicit ? limit : (rows.length || 1)));

  } catch (error) {
    console.error('[getAllPayments Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve payments.' });
  }
}

// Customer get own payments
async function getCustomerPayments(req, res) {
  try {
    const [cRows] = await query('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
    if (cRows.length === 0) return res.status(404).json({ success: false, message: 'Customer record not found.' });

    req.query.customer_id = cRows[0].id;
    return getAllPayments(req, res);

  } catch (error) {
    console.error('[getCustomerPayments Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve customer payments.' });
  }
}

// Process mock payment (Customer initiates) - Fully synchronized with Booking Services & Budget Items
async function processPayment(req, res) {
  try {
    const { payment_id, payment_method = 'MOCK_UPI', upi_id, card_number, simulate_failure = false } = req.body;

    if (!payment_id) {
      return res.status(400).json({ success: false, message: 'Payment ID is required.' });
    }

    // 1. Fetch payment and booking details with security checks
    const [pRows] = await query(
      `SELECT p.*, b.wedding_project_id, b.planner_id, b.total_amount, b.paid_amount, b.status AS booking_status,
              wp.title AS project_title,
              pl.user_id AS planner_user_id,
              c.user_id AS customer_user_id
       FROM payments p
       JOIN bookings b ON p.booking_id = b.id
       JOIN wedding_projects wp ON b.wedding_project_id = wp.id
       JOIN planners pl ON b.planner_id = pl.id
       JOIN customers c ON p.customer_id = c.id
       WHERE p.id = ?`,
      [payment_id]
    );

    if (pRows.length === 0) return res.status(404).json({ success: false, message: 'Payment record not found.' });

    const payment = pRows[0];

    // Data integrity validations (Requirement 20)
    if (payment.customer_user_id !== req.user.id && req.user.role_name !== 'PLANNER') {
      return res.status(403).json({ success: false, message: 'Forbidden. You can only process payments for your own booking.' });
    }

    if (parseFloat(payment.amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payment amount. Amount must be positive.' });
    }

    if (payment.booking_status === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Cannot process payment for a cancelled booking.' });
    }

    if (payment.status === 'SUCCESS') {
      return res.status(400).json({ success: false, message: 'This payment milestone has already been completed.' });
    }

    const payAmount = parseFloat(payment.amount);
    const txnRef = `TXN_MOCK_${Date.now()}${Math.floor(100 + Math.random() * 900)}`;

    // Handle Payment Failure simulation (Requirement 19 & 40)
    if (simulate_failure) {
      const failGatewayResponse = JSON.stringify({
        gateway: 'MOCK_SIMULATOR',
        transaction_id: txnRef,
        method: payment_method,
        amount: payAmount,
        currency: 'INR',
        status: 'FAILED',
        reason: 'Simulated payment gateway failure (test retry)',
        timestamp: new Date().toISOString()
      });

      await query(
        `INSERT INTO payment_transactions (payment_id, transaction_reference, payment_method, amount, currency, status, gateway_response, paid_at)
         VALUES (?, ?, ?, ?, 'INR', 'FAILED', ?, CURRENT_TIMESTAMP)`,
        [payment_id, txnRef, payment_method, payAmount, failGatewayResponse]
      );

      await query(`UPDATE payments SET status = 'FAILED' WHERE id = ?`, [payment_id]);

      await createNotification({
        userId: payment.customer_user_id,
        title: 'Payment Failed',
        message: `Your payment of ₹${Number(payAmount).toLocaleString('en-IN')} for "${payment.title}" could not be completed. You can safely retry.`,
        notificationType: 'PAYMENT_FAILED',
        referenceId: payment_id,
        referenceType: 'payment'
      });

      return res.status(400).json({
        success: false,
        code: 'PAYMENT_FAILED',
        message: 'Payment processing failed at mock gateway. Please retry.',
        transaction_reference: txnRef,
        can_retry: true
      });
    }

    // 2. Successful transaction recording
    const gatewayResponse = JSON.stringify({
      gateway: 'MOCK_SIMULATOR',
      transaction_id: txnRef,
      method: payment_method,
      amount: payAmount,
      currency: 'INR',
      status: 'SUCCESS',
      timestamp: new Date().toISOString(),
      details: payment_method === 'MOCK_UPI' ? { upi_id: upi_id || 'customer@upi' } : { last4: card_number ? card_number.slice(-4) : '4242' }
    });

    // 3. Insert transaction
    await query(
      `INSERT INTO payment_transactions (payment_id, transaction_reference, payment_method, amount, currency, status, gateway_response, paid_at)
       VALUES (?, ?, ?, ?, 'INR', 'SUCCESS', ?, CURRENT_TIMESTAMP)`,
      [payment_id, txnRef, payment_method, payAmount, gatewayResponse]
    );

    // 4. Update payment status to SUCCESS
    await query(`UPDATE payments SET status = 'SUCCESS' WHERE id = ?`, [payment_id]);

    // 5. Synchronize Booking Services service-wise paid amounts (Requirements 17 & 18)
    if (payment.booking_service_id) {
      await query(
        `UPDATE booking_services 
         SET paid_amount = LEAST(agreed_price, paid_amount + ?)
         WHERE id = ?`,
        [payAmount, payment.booking_service_id]
      );
    } else {
      // Proportional allocation across arranged booking services
      const [services] = await query(
        `SELECT id, agreed_price, paid_amount FROM booking_services WHERE booking_id = ?`,
        [payment.booking_id]
      );
      const totalContract = services.reduce((acc, s) => acc + parseFloat(s.agreed_price), 0);
      if (totalContract > 0) {
        for (const s of services) {
          const ratio = parseFloat(s.agreed_price) / totalContract;
          const serviceShare = Math.round(payAmount * ratio * 100) / 100;
          await query(
            `UPDATE booking_services 
             SET paid_amount = LEAST(agreed_price, paid_amount + ?) 
             WHERE id = ?`,
            [serviceShare, s.id]
          );
        }
      }
    }

    // 6. Update booking paid_amount and state transition
    const newPaidAmount = parseFloat(payment.paid_amount) + payAmount;
    const totalAmount = parseFloat(payment.total_amount);

    let newBookingStatus = 'CONFIRMED';
    if (newPaidAmount >= totalAmount && totalAmount > 0) {
      newBookingStatus = 'FULLY_PAID';
    } else {
      newBookingStatus = 'CONFIRMED'; // Milestone paid secures the booking
    }

    await query(
      `UPDATE bookings SET paid_amount = ?, status = ? WHERE id = ?`,
      [newPaidAmount, newBookingStatus, payment.booking_id]
    );

    // Also update project status to CONFIRMED
    await query(
      `UPDATE wedding_projects SET status = 'CONFIRMED' WHERE id = ?`,
      [payment.wedding_project_id]
    );

    // 7. Synchronize Budget Tracker & Budget Items (Requirements 18 & 21)
    await query(
      `UPDATE budgets 
       SET spent_amount = spent_amount + ?, 
           remaining_amount = GREATEST(0, total_budget - (spent_amount + ?))
       WHERE wedding_project_id = ?`,
      [payAmount, payAmount, payment.wedding_project_id]
    );

    // Sync to itemized budget_items
    const [bList] = await query('SELECT id FROM budgets WHERE wedding_project_id = ?', [payment.wedding_project_id]);
    if (bList.length > 0) {
      const budgetId = bList[0].id;
      if (payment.booking_service_id) {
        const [bsData] = await query('SELECT service_name, category_name FROM booking_services WHERE id = ?', [payment.booking_service_id]);
        if (bsData.length > 0) {
          await query(
            `UPDATE budget_items 
             SET paid_cost = paid_cost + ?,
                 status = CASE WHEN (paid_cost + ?) >= actual_cost AND actual_cost > 0 THEN 'PAID' ELSE 'BOOKED' END
             WHERE budget_id = ? AND (item_name LIKE ? OR category_id IN (SELECT id FROM service_categories WHERE name = ?))
             LIMIT 1`,
            [payAmount, payAmount, budgetId, `%${bsData[0].service_name}%`, bsData[0].category_name]
          );
        }
      } else {
        const [items] = await query('SELECT id, actual_cost, estimated_cost, paid_cost FROM budget_items WHERE budget_id = ?', [budgetId]);
        const sumActual = items.reduce((acc, i) => acc + parseFloat(i.actual_cost > 0 ? i.actual_cost : i.estimated_cost), 0);
        if (sumActual > 0) {
          for (const item of items) {
            const cost = parseFloat(item.actual_cost > 0 ? item.actual_cost : item.estimated_cost);
            const itemShare = Math.round((cost / sumActual) * payAmount * 100) / 100;
            await query(
              `UPDATE budget_items 
               SET paid_cost = LEAST(COALESCE(NULLIF(actual_cost, 0), estimated_cost), paid_cost + ?),
                   status = CASE WHEN (paid_cost + ?) >= COALESCE(NULLIF(actual_cost, 0), estimated_cost) THEN 'PAID' ELSE 'BOOKED' END
               WHERE id = ?`,
              [itemShare, itemShare, item.id]
            );
          }
        }
      }
    }

    // 8. Automatically generate Invoice in invoices table
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;
    await query(
      `INSERT INTO invoices (invoice_number, booking_id, payment_id, issuer_id, recipient_id, subtotal, tax_amount, total_amount, status, due_date, pdf_url)
       VALUES (?, ?, ?, ?, ?, ?, 0.00, ?, 'PAID', CURRENT_DATE, ?)`,
      [
        invoiceNumber,
        payment.booking_id,
        payment_id,
        payment.planner_user_id,
        payment.customer_user_id,
        payAmount,
        payAmount,
        `/uploads/invoices/${invoiceNumber}.pdf`
      ]
    );

    // 9. Dispatch Notifications
    // Customer
    await createNotification({
      userId: payment.customer_user_id,
      title: 'Payment Successful!',
      message: `Your payment of ₹${Number(payAmount).toLocaleString('en-IN')} for "${payment.title}" was successfully processed. Ref: ${txnRef}. Your booking is now CONFIRMED.`,
      notificationType: 'PAYMENT_SUCCESS',
      referenceId: payment_id,
      referenceType: 'payment'
    });

    // Planner
    await createNotification({
      userId: payment.planner_user_id,
      title: 'Payment Received from Customer',
      message: `Received ₹${Number(payAmount).toLocaleString('en-IN')} for project "${payment.project_title}" (${payment.milestone_name}). Ref: ${txnRef}.`,
      notificationType: 'PAYMENT_SUCCESS',
      referenceId: payment_id,
      referenceType: 'payment'
    });

    // Vendors arranged
    const [vendors] = await query(
      `SELECT v.user_id, v.business_name FROM booking_services bs JOIN vendors v ON bs.vendor_id = v.id WHERE bs.booking_id = ?`,
      [payment.booking_id]
    );
    for (const vend of vendors) {
      await createNotification({
        userId: vend.user_id,
        title: 'Wedding Booking Confirmed!',
        message: `The customer has submitted milestone payment for "${payment.project_title}". Your engagement is officially CONFIRMED on the schedule.`,
        notificationType: 'BOOKING_CONFIRMED',
        referenceId: payment.booking_id,
        referenceType: 'booking'
      });
    }

    return res.json({
      success: true,
      message: 'Payment processed successfully! Transaction verified and receipt generated.',
      transaction: {
        reference: txnRef,
        amount: payAmount,
        method: payment_method,
        status: 'SUCCESS',
        booking_status: newBookingStatus
      }
    });

  } catch (error) {
    console.error('[processPayment Error]:', error);
    return res.status(500).json({ success: false, message: 'Payment processing failed.' });
  }
}

// Vendor earnings summary & transactions
async function getVendorPayments(req, res) {
  try {
    const vendorId = req.user.vendor_id;
    if (!vendorId) return res.status(403).json({ success: false, message: 'Vendor profile not found.' });

    const [services] = await query(
      `SELECT bs.*, b.status AS booking_status, b.paid_amount, b.total_amount,
              wp.project_code, wp.title AS project_title, wp.wedding_date,
              cu.full_name AS customer_name
       FROM booking_services bs
       JOIN bookings b ON bs.booking_id = b.id
       JOIN wedding_projects wp ON b.wedding_project_id = wp.id
       JOIN customers c ON b.customer_id = c.id
       JOIN users cu ON c.user_id = cu.id
       WHERE bs.vendor_id = ?`,
      [vendorId]
    );

    // Format into comprehensive milestone payment records
    const paymentRecords = [];
    services.forEach((s) => {
      const agreed = parseFloat(s.agreed_price || 0);
      const isConfirmed = ['CONFIRMED', 'COMPLETED', 'PARTIALLY_PAID'].includes(s.status) || ['CONFIRMED', 'FULLY_PAID'].includes(s.booking_status);
      const isFullySettled = s.status === 'COMPLETED' || s.booking_status === 'FULLY_PAID';

      // 1. Advance Milestone (30%)
      paymentRecords.push({
        id: `VND-PAY-${s.id}-ADV`,
        transaction_reference: `TXN-ADV-${s.booking_id}-${s.vendor_id}`,
        project_title: s.project_title || 'Royal Wedding Project',
        project_code: s.project_code,
        customer_name: s.customer_name || 'Wedding Client',
        customer_id: s.customer_id,
        milestone_type: 'Advance Retainer (30%)',
        amount: Math.round(agreed * 0.3),
        status: isConfirmed ? 'COMPLETED' : 'PENDING',
        payment_method: 'NEFT / Razorpay Escrow',
        created_at: s.created_at || s.wedding_date || new Date().toISOString()
      });

      // 2. Mid-Term Milestone (40%)
      paymentRecords.push({
        id: `VND-PAY-${s.id}-MID`,
        transaction_reference: `TXN-MID-${s.booking_id}-${s.vendor_id}`,
        project_title: s.project_title || 'Royal Wedding Project',
        project_code: s.project_code,
        customer_name: s.customer_name || 'Wedding Client',
        customer_id: s.customer_id,
        milestone_type: 'Mid-Term Progress (40%)',
        amount: Math.round(agreed * 0.4),
        status: isFullySettled ? 'COMPLETED' : 'PENDING',
        payment_method: 'NEFT / UPI Bank Transfer',
        created_at: s.wedding_date || new Date().toISOString()
      });

      // 3. Final Settlement (30%)
      paymentRecords.push({
        id: `VND-PAY-${s.id}-FIN`,
        transaction_reference: `TXN-FIN-${s.booking_id}-${s.vendor_id}`,
        project_title: s.project_title || 'Royal Wedding Project',
        project_code: s.project_code,
        customer_name: s.customer_name || 'Wedding Client',
        customer_id: s.customer_id,
        milestone_type: 'Final Ceremony Settlement (30%)',
        amount: agreed - Math.round(agreed * 0.3) - Math.round(agreed * 0.4),
        status: s.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
        payment_method: 'Direct Bank NEFT',
        created_at: s.wedding_date || new Date().toISOString()
      });
    });

    const totalContracted = services.reduce((acc, curr) => acc + parseFloat(curr.agreed_price || 0), 0);
    const completedPayments = paymentRecords.filter(p => p.status === 'COMPLETED');
    const totalDisbursed = completedPayments.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);

    return res.json({
      success: true,
      data: paymentRecords,
      summary: {
        total_contracted: totalContracted,
        total_disbursed: totalDisbursed,
        pending_payout: totalContracted - totalDisbursed,
        services_count: services.length,
        bookings: services
      }
    });

  } catch (error) {
    console.error('[getVendorPayments Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch vendor earnings.' });
  }
}

module.exports = {
  getAllPayments,
  getCustomerPayments,
  processPayment,
  getVendorPayments
};
