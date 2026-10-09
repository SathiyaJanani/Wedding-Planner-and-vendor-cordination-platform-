const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const { supportLimiter } = require('../middleware/rateLimiter');

router.use(authMiddleware);

router.get('/', supportController.getSupportTickets);
router.post('/', supportLimiter, supportController.createSupportTicket);
router.put('/:id/respond', authorizeRoles('PLANNER'), supportController.updateSupportTicket);
router.put('/:id/status', authorizeRoles('PLANNER'), supportController.updateSupportTicket);
router.put('/:id', authorizeRoles('PLANNER'), supportController.updateSupportTicket);

module.exports = router;
