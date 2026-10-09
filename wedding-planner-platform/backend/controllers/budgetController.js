const { query } = require('../config/db');

// Get budget overview for a project (with service-wise and vendor-wise breakdowns and items filtering/pagination)
async function getProjectBudget(req, res) {
  try {
    const { projectId } = req.params;
    const { search, category_id, status, sort_by } = req.query;

    const [bRows] = await query(
      `SELECT b.*, wp.title AS project_title, wp.wedding_date, wp.total_budget AS project_target_budget
       FROM budgets b
       JOIN wedding_projects wp ON b.wedding_project_id = wp.id
       WHERE b.wedding_project_id = ?`,
      [projectId]
    );

    if (bRows.length === 0) return res.status(404).json({ success: false, message: 'Budget record not found.' });

    const budget = bRows[0];

    // 1. Fetch all items for overall sums
    const [allItems] = await query(
      `SELECT bi.*, sc.name AS category_name, sc.slug AS category_slug, sc.icon AS category_icon
       FROM budget_items bi
       LEFT JOIN service_categories sc ON bi.category_id = sc.id
       WHERE bi.budget_id = ?`,
      [budget.id]
    );

    // 2. Fetch filtered items for presentation
    let itemsWhere = `WHERE bi.budget_id = ?`;
    const itemsParams = [budget.id];

    if (search) {
      itemsWhere += ` AND (bi.item_name LIKE ? OR sc.name LIKE ? OR bi.notes LIKE ?)`;
      const term = `%${search}%`;
      itemsParams.push(term, term, term);
    }

    if (category_id) {
      itemsWhere += ` AND bi.category_id = ?`;
      itemsParams.push(category_id);
    }

    if (status) {
      itemsWhere += ` AND bi.status = ?`;
      itemsParams.push(status);
    }

    const sortMap = {
      cost_desc: 'COALESCE(NULLIF(bi.actual_cost, 0), bi.estimated_cost) DESC',
      cost_asc: 'COALESCE(NULLIF(bi.actual_cost, 0), bi.estimated_cost) ASC',
      paid_desc: 'bi.paid_cost DESC',
      name_asc: 'bi.item_name ASC',
      newest: 'bi.id DESC'
    };
    const orderClause = sortMap[sort_by] || 'bi.estimated_cost DESC';

    const [filteredItems] = await query(
      `SELECT bi.*, sc.name AS category_name, sc.slug AS category_slug, sc.icon AS category_icon
       FROM budget_items bi
       LEFT JOIN service_categories sc ON bi.category_id = sc.id
       ${itemsWhere}
       ORDER BY ${orderClause}`,
      itemsParams
    );

    // 3. Service-wise breakdown (Requirement 11)
    const serviceMap = new Map();
    for (const item of allItems) {
      const catName = item.category_name || item.item_name;
      const alloc = parseFloat(item.actual_cost > 0 ? item.actual_cost : item.estimated_cost || 0);
      const paid = parseFloat(item.paid_cost || 0);
      if (!serviceMap.has(catName)) {
        serviceMap.set(catName, {
          service: catName,
          category_id: item.category_id,
          total_amount: alloc,
          paid_amount: paid,
          pending_amount: Math.max(0, alloc - paid),
          status: item.status
        });
      } else {
        const exist = serviceMap.get(catName);
        exist.total_amount += alloc;
        exist.paid_amount += paid;
        exist.pending_amount = Math.max(0, exist.total_amount - exist.paid_amount);
      }
    }
    const service_wise = Array.from(serviceMap.values());

    // 4. Vendor-wise breakdown (Requirement 11)
    const [vendorItems] = await query(
      `SELECT bs.id, bs.service_name, bs.category_name, bs.agreed_price, bs.paid_amount,
              v.business_name AS vendor_name, v.city AS vendor_city,
              b.booking_code, b.status AS booking_status
       FROM booking_services bs
       JOIN vendors v ON bs.vendor_id = v.id
       JOIN bookings b ON bs.booking_id = b.id
       WHERE b.wedding_project_id = ?`,
      [projectId]
    );
    const vendor_wise = vendorItems.map(vi => ({
      vendor_name: vi.vendor_name,
      service_name: vi.service_name,
      category: vi.category_name,
      total_amount: parseFloat(vi.agreed_price || 0),
      paid_amount: parseFloat(vi.paid_amount || 0),
      pending_amount: Math.max(0, parseFloat(vi.agreed_price || 0) - parseFloat(vi.paid_amount || 0)),
      payment_status: parseFloat(vi.paid_amount || 0) >= parseFloat(vi.agreed_price || 0) ? 'FULLY_PAID' : parseFloat(vi.paid_amount || 0) > 0 ? 'PARTIALLY_PAID' : 'PENDING'
    }));

    // 5. Calculate live aggregations from database
    const totalBudget = parseFloat(budget.total_budget);
    const totalAllocated = allItems.reduce((acc, curr) => acc + parseFloat(curr.actual_cost > 0 ? curr.actual_cost : curr.estimated_cost), 0);
    const totalPaid = allItems.reduce((acc, curr) => acc + parseFloat(curr.paid_cost || 0), 0);
    const pendingAmount = Math.max(0, totalAllocated - totalPaid);
    const remainingAmount = Math.max(0, totalBudget - totalPaid);

    budget.items = filteredItems;
    budget.service_wise = service_wise;
    budget.vendor_wise = vendor_wise;
    budget.summary = {
      total_budget: totalBudget,
      allocated_amount: totalAllocated,
      spent_amount: totalPaid,
      paid_amount: totalPaid,
      pending_amount: pendingAmount,
      remaining_amount: remainingAmount,
      items_count: filteredItems.length,
      total_items_count: allItems.length
    };

    return res.json({ success: true, data: budget });

  } catch (error) {
    console.error('[getProjectBudget Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve budget.' });
  }
}

// Customer get own budget
async function getCustomerBudget(req, res) {
  try {
    const [cRows] = await query('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
    if (cRows.length === 0) return res.status(404).json({ success: false, message: 'Customer record not found.' });

    const [pRows] = await query('SELECT id FROM wedding_projects WHERE customer_id = ? ORDER BY id DESC LIMIT 1', [cRows[0].id]);
    if (pRows.length === 0) {
      return res.json({ success: true, data: null, message: 'No wedding project found for customer.' });
    }

    req.params.projectId = pRows[0].id;
    return getProjectBudget(req, res);

  } catch (error) {
    console.error('[getCustomerBudget Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve customer budget.' });
  }
}

// Add budget item (Planner)
async function addBudgetItem(req, res) {
  try {
    const { budget_id, category_id, item_name, estimated_cost, actual_cost, paid_cost, status, notes } = req.body;

    if (!budget_id || !item_name || estimated_cost === undefined) {
      return res.status(400).json({ success: false, message: 'Budget ID, item name, and estimated cost are required.' });
    }

    const [result] = await query(
      `INSERT INTO budget_items (budget_id, category_id, item_name, estimated_cost, actual_cost, paid_cost, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [budget_id, category_id || null, item_name, parseFloat(estimated_cost), parseFloat(actual_cost || 0), parseFloat(paid_cost || 0), status || 'PLANNED', notes || null]
    );

    // Update parent budget allocated_amount
    await query(
      `UPDATE budgets SET allocated_amount = (SELECT SUM(COALESCE(actual_cost, estimated_cost)) FROM budget_items WHERE budget_id = ?) WHERE id = ?`,
      [budget_id, budget_id]
    );

    return res.status(201).json({
      success: true,
      message: 'Budget item added successfully.',
      item_id: result.insertId
    });

  } catch (error) {
    console.error('[addBudgetItem Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to add budget item.' });
  }
}

// Update budget item
async function updateBudgetItem(req, res) {
  try {
    const { id } = req.params;
    const { item_name, category_id, estimated_cost, actual_cost, paid_cost, status, notes } = req.body;

    await query(
      `UPDATE budget_items SET
        item_name = COALESCE(?, item_name),
        category_id = COALESCE(?, category_id),
        estimated_cost = COALESCE(?, estimated_cost),
        actual_cost = COALESCE(?, actual_cost),
        paid_cost = COALESCE(?, paid_cost),
        status = COALESCE(?, status),
        notes = COALESCE(?, notes)
       WHERE id = ?`,
      [item_name, category_id, estimated_cost, actual_cost, paid_cost, status, notes, id]
    );

    return res.json({ success: true, message: 'Budget item updated successfully.' });

  } catch (error) {
    console.error('[updateBudgetItem Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update budget item.' });
  }
}

// Delete budget item
async function deleteBudgetItem(req, res) {
  try {
    const { id } = req.params;
    await query('DELETE FROM budget_items WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Budget item deleted successfully.' });
  } catch (error) {
    console.error('[deleteBudgetItem Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete budget item.' });
  }
}

module.exports = {
  getProjectBudget,
  getCustomerBudget,
  addBudgetItem,
  updateBudgetItem,
  deleteBudgetItem
};
