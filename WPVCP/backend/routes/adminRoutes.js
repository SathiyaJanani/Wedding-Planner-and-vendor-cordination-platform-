const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// Protect all admin routes with JWT auth and ADMIN or PLANNER role
router.use(authMiddleware);
router.use(authorizeRoles('ADMIN', 'PLANNER'));

router.get('/metrics', adminController.getAdminMetrics);
router.get('/users', adminController.getAdminUsers);
router.put('/users/:id/status', adminController.toggleUserStatus);
router.get('/logs', adminController.getAdminAuditLogs);

module.exports = router;
