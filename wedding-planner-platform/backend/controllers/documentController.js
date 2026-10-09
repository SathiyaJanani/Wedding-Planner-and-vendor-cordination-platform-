const path = require('path');
const fs = require('fs');
const { query } = require('../config/db');
const { parsePagination, buildPaginationResponse, buildOrderBy } = require('../utils/queryHelper');

// Get documents (by project_id or user)
async function getDocuments(req, res) {
  try {
    const { project_id, document_type, search, sort_by } = req.query;
    const { page, limit, offset, isExplicit } = parsePagination(req.query, 10, 100);

    let baseFromWhere = `
      FROM documents d
      JOIN users u ON d.uploader_id = u.id
      LEFT JOIN wedding_projects wp ON d.wedding_project_id = wp.id
      WHERE d.status = 'ACTIVE'
    `;
    const params = [];

    if (project_id) {
      baseFromWhere += ` AND d.wedding_project_id = ?`;
      params.push(project_id);
    }

    if (document_type) {
      baseFromWhere += ` AND d.document_type = ?`;
      params.push(document_type);
    }

    // Role-based visibility
    if (req.user.role_name === 'CUSTOMER') {
      baseFromWhere += ` AND (d.wedding_project_id IN (SELECT id FROM wedding_projects WHERE customer_id = ?) OR d.uploader_id = ?)`;
      params.push(req.user.customer_id || 0, req.user.id);
    } else if (req.user.role_name === 'VENDOR') {
      const vendorId = req.user.vendor_id || 0;
      baseFromWhere += ` AND (
        d.uploader_id = ?
        OR d.wedding_project_id IN (
          SELECT b.wedding_project_id 
          FROM bookings b 
          JOIN booking_services bs ON bs.booking_id = b.id 
          WHERE bs.vendor_id = ?
        )
        OR d.wedding_project_id IN (
          SELECT vr.wedding_project_id 
          FROM vendor_requests vr 
          WHERE vr.vendor_id = ?
        )
      )`;
      params.push(req.user.id, vendorId, vendorId);
    }

    if (search) {
      baseFromWhere += ` AND (d.title LIKE ? OR wp.title LIKE ? OR wp.project_code LIKE ? OR u.full_name LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    // 1. Total count
    const [countRows] = await query(`SELECT COUNT(*) AS total ${baseFromWhere}`, params);
    const totalCount = countRows[0]?.total || 0;

    // 2. Sorting
    const sortMap = {
      newest: 'd.created_at DESC',
      title_asc: 'd.title ASC',
      size_desc: 'd.file_size DESC',
      size_asc: 'd.file_size ASC'
    };
    const orderClause = buildOrderBy(sort_by, sortMap, 'd.created_at DESC');

    // 3. Selection query
    let selectSql = `
      SELECT d.*, u.full_name AS uploader_name, u.email AS uploader_email,
             wp.project_code, wp.title AS project_title
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
    console.error('[getDocuments Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve documents.' });
  }
}

// Upload/create new document record
async function createDocument(req, res) {
  try {
    const { wedding_project_id, title, document_type, file_path, file_size, file_type } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Document title is required.' });
    }

    const finalPath = req.file ? `/uploads/docs/${req.file.filename}` : (file_path || '/uploads/docs/sample_document.pdf');
    const finalSize = req.file ? req.file.size : (file_size || 524288);
    const finalType = req.file ? req.file.mimetype : (file_type || 'application/pdf');

    const [result] = await query(
      `INSERT INTO documents (wedding_project_id, uploader_id, title, document_type, file_path, file_size, file_type, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
      [wedding_project_id || null, req.user.id, title, document_type || 'OTHER', finalPath, finalSize, finalType]
    );

    return res.status(201).json({
      success: true,
      message: 'Document uploaded successfully.',
      document_id: result.insertId,
      file_path: finalPath
    });

  } catch (error) {
    console.error('[createDocument Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to create document.' });
  }
}

// Delete document (soft delete / archive)
async function deleteDocument(req, res) {
  try {
    const { id } = req.params;
    let sql = `UPDATE documents SET status = 'ARCHIVED' WHERE id = ?`;
    const params = [id];

    if (req.user.role_name !== 'PLANNER') {
      sql += ` AND uploader_id = ?`;
      params.push(req.user.id);
    }

    const [result] = await query(sql, params);
    if (result.affectedRows === 0) {
      return res.status(403).json({ success: false, message: 'Document not found or unauthorized to archive.' });
    }

    return res.json({ success: true, message: 'Document archived successfully.' });
  } catch (error) {
    console.error('[deleteDocument Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to archive document.' });
  }
}

module.exports = {
  getDocuments,
  createDocument,
  deleteDocument
};
